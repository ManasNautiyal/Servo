import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const ServiceCard = ({ service }) => {
  const { id, title, description, category, price, delivery_time, image_url, tags, provider } = service;

  // Visual highlights for categories in brutalist theme
  const categoryColors = {
    Technical: 'bg-blue-300 text-brutal-charcoal border-brutal-charcoal',
    Creative: 'bg-pink-300 text-brutal-charcoal border-brutal-charcoal',
    Academic: 'bg-emerald-300 text-brutal-charcoal border-brutal-charcoal',
    Career: 'bg-brutal-yellow text-brutal-charcoal border-brutal-charcoal',
    Other: 'bg-orange-300 text-brutal-charcoal border-brutal-charcoal',
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full overflow-hidden rounded-none border-2 border-brutal-charcoal bg-white shadow-brutal-md hover:shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-md dark:hover:shadow-brutal-dark-sm transition-all"
    >
      {/* Service Cover Image */}
      <Link to={`/service/${id}`} className="relative block overflow-hidden pb-[56.25%] border-b-2 border-brutal-charcoal dark:border-white">
        <img
          src={imgSource}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className={`rounded-none border-2 px-2.5 py-0.5 text-xs font-black shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] ${getCategoryStyle(category)}`}>
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
                  className="h-6 w-6 rounded-none object-cover border border-brutal-charcoal dark:border-white"
                  src={avatarSource}
                  alt={provider.name}
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-none border border-brutal-charcoal bg-brutal-yellow text-[10px] font-black text-brutal-charcoal">
                  {provider.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-brutal-charcoal dark:text-gray-300 hover:underline">
                {provider.name} • Year {provider.year}
              </span>
            </Link>
          )}

          {/* Title */}
          <Link to={`/service/${id}`} className="block group">
            <h3 className="line-clamp-2 text-sm font-black text-brutal-charcoal hover:underline dark:text-white transition-colors">
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
                <span key={idx} className="flex items-center text-[10px] font-bold text-brutal-charcoal bg-gray-100 border border-brutal-charcoal dark:bg-darkBg/50 dark:text-white dark:border-white px-1.5 py-0.5 rounded-none">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info: Delivery and Price */}
        <div className="mt-4 border-t-2 border-brutal-charcoal/20 pt-3 flex items-center justify-between dark:border-white/20">
          <div className="flex items-center space-x-1 text-xs text-brutal-charcoal dark:text-gray-300 font-bold">
            <Clock className="h-3.5 w-3.5" />
            <span>{delivery_time} days delivery</span>
          </div>

          <div className="flex items-baseline space-x-0.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Starting at</span>
            <span className="text-base font-black text-brutal-red dark:text-brutal-yellow">₹{price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
