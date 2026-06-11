import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const ServiceCard = ({ service }) => {
  const { id, title, description, category, price, delivery_time, image_url, tags, provider } = service;

  // Visual highlights for categories
  const categoryColors = {
    Technical: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/40',
    Creative: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/40',
    Academic: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/40',
    Career: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/40',
    Other: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200/40',
  };

  const getCategoryStyle = (cat) => categoryColors[cat] || categoryColors.Other;

  // Clean tags parser
  const parsedTags = tags ? tags.split(',').map(t => t.trim()).slice(0, 3) : [];

  const imgSource = image_url 
    ? (image_url.startsWith('http') ? image_url : `${API_BASE_URL}${image_url}`)
    : 'https://images.unsplash.com/photo-1521737711867-e3b90473bd58?auto=format&fit=crop&q=80&w=600';

  const avatarSource = provider?.profile_picture
    ? (provider.profile_picture.startsWith('http') ? provider.profile_picture : `${API_BASE_URL}${provider.profile_picture}`)
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md dark:border-darkBorder dark:bg-darkCard transition-all"
    >
      {/* Service Cover Image */}
      <Link to={`/service/${id}`} className="relative block overflow-hidden pb-[56.25%]">
        <img
          src={imgSource}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${getCategoryStyle(category)}`}>
            {category}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 justify-between">
        <div className="space-y-2">
          {/* Provider header info */}
          {provider && (
            <Link to={`/profile/${provider.id}`} className="flex items-center space-x-2">
              {avatarSource ? (
                <img
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-brand-100"
                  src={avatarSource}
                  alt={provider.name}
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                  {provider.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-brand-500">
                {provider.name} • Year {provider.year}
              </span>
            </Link>
          )}

          {/* Title */}
          <Link to={`/service/${id}`} className="block group">
            <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-brand-500 dark:text-white transition-colors">
              {title}
            </h3>
          </Link>

          {/* Description summary */}
          <p className="line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
            {description}
          </p>

          {/* Tags list */}
          {parsedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {parsedTags.map((tag, idx) => (
                <span key={idx} className="flex items-center text-[10px] font-medium text-gray-600 bg-gray-100 dark:bg-darkBg/50 dark:text-gray-300 px-1.5 py-0.5 rounded">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Delivery and Price */}
        <div className="mt-4 border-t border-gray-50 pt-3 flex items-center justify-between dark:border-darkBorder">
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{delivery_time} days delivery</span>
          </div>

          <div className="flex items-baseline space-x-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Starting at</span>
            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">₹{price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
