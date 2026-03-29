import { supabase, PincodeData } from '../lib/supabase';

export interface PincodeResult {
  pincode: string;
  area: string | null;
  city: string;
  state: string;
  is_serviceable: boolean;
  delivery_days: number;
}

export interface PincodeDetails extends PincodeResult {
  district: string | null;
  state_code: string | null;
}

export interface ServiceabilityInfo {
  is_serviceable: boolean;
  delivery_days: number;
  estimated_date: string;
  message: string;
}

export class PincodeService {
  private static cache = new Map<string, PincodeDetails>();
  private static CACHE_TTL = 3600000;

  static async searchPincodes(query: string): Promise<PincodeResult[]> {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      const sanitizedQuery = query.trim();

      const { data, error } = await supabase
        .from('pincodes')
        .select('pincode, area, city, state, is_serviceable, delivery_days')
        .or(`pincode.like.${sanitizedQuery}%,city.ilike.%${sanitizedQuery}%,area.ilike.%${sanitizedQuery}%`)
        .eq('is_serviceable', true)
        .order('pincode', { ascending: true })
        .limit(8);

      if (error) throw error;

      this.logSearch(sanitizedQuery, data?.[0]?.pincode || null);

      return data || [];
    } catch (error) {
      console.error('Error searching pincodes:', error);
      return [];
    }
  }

  static async getPincodeDetails(pincode: string): Promise<PincodeDetails | null> {
    if (!pincode || pincode.length !== 6) {
      return null;
    }

    const cached = this.cache.get(pincode);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('pincodes')
        .select('*')
        .eq('pincode', pincode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const details: PincodeDetails = {
          pincode: data.pincode,
          area: data.area,
          city: data.city,
          district: data.district,
          state: data.state,
          state_code: data.state_code,
          is_serviceable: data.is_serviceable,
          delivery_days: data.delivery_days,
        };

        this.cache.set(pincode, details);

        setTimeout(() => {
          this.cache.delete(pincode);
        }, this.CACHE_TTL);

        return details;
      }

      return null;
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      return null;
    }
  }

  static async checkServiceability(pincode: string): Promise<ServiceabilityInfo> {
    const details = await this.getPincodeDetails(pincode);

    if (!details) {
      return {
        is_serviceable: false,
        delivery_days: 0,
        estimated_date: '',
        message: 'Invalid pincode or delivery not available in this area',
      };
    }

    const estimatedDate = this.calculateDeliveryDate(details.delivery_days);

    return {
      is_serviceable: details.is_serviceable,
      delivery_days: details.delivery_days,
      estimated_date: estimatedDate,
      message: details.is_serviceable
        ? `Delivery available in ${details.delivery_days} days`
        : 'Delivery not available in this area',
    };
  }

  static calculateDeliveryDate(days: number): string {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + days);

    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private static async logSearch(query: string, resultPincode: string | null) {
    try {
      const sessionId = this.getSessionId();

      await supabase.from('pincode_searches').insert({
        search_query: query,
        result_pincode: resultPincode,
        user_session_id: sessionId,
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('pincode_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('pincode_session_id', sessionId);
    }
    return sessionId;
  }

  static clearCache() {
    this.cache.clear();
  }
}
