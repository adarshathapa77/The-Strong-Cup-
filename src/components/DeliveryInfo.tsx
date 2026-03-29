import React from 'react';
import { motion } from 'motion/react';
import { Truck, CheckCircle2, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { ServiceabilityInfo } from '../services/pincodeService';

interface DeliveryInfoProps {
  deliveryInfo: ServiceabilityInfo;
  city?: string;
  state?: string;
  className?: string;
}

export default function DeliveryInfo({ deliveryInfo, city, state, className = '' }: DeliveryInfoProps) {
  const { is_serviceable, delivery_days, estimated_date, message } = deliveryInfo;

  const getDeliveryColor = (days: number) => {
    if (days <= 2) return 'text-tea-green';
    if (days <= 4) return 'text-tea-gold';
    return 'text-tea-brown';
  };

  const getDeliveryBgColor = (days: number) => {
    if (days <= 2) return 'bg-tea-green/10 border-tea-green/20';
    if (days <= 4) return 'bg-tea-gold/10 border-tea-gold/20';
    return 'bg-tea-brown/5 border-tea-brown/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {is_serviceable ? (
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl border ${getDeliveryBgColor(delivery_days)} flex items-start space-x-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getDeliveryColor(delivery_days)} bg-white shadow-sm`}>
              <Truck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle2 size={16} className="text-tea-green flex-shrink-0" />
                <span className="text-sm font-bold text-tea-brown">Delivery Available</span>
              </div>
              <p className="text-xs text-tea-brown/60 mb-2">{message}</p>

              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className={getDeliveryColor(delivery_days)} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-tea-brown/40">Estimated Delivery</p>
                    <p className="text-sm font-bold text-tea-brown">{estimated_date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {city && state && (
            <div className="flex items-center space-x-2 text-tea-brown/60 text-xs pl-2">
              <MapPin size={14} className="flex-shrink-0" />
              <span>Delivering to {city}, {state}</span>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-4"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 text-red-500 shadow-sm">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-700 mb-1">Delivery Not Available</h4>
            <p className="text-xs text-red-600">{message}</p>
            <p className="text-xs text-red-500 mt-2">
              Please try a different pincode or contact support for assistance.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
