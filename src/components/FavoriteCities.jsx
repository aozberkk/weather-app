import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './FavoriteCities.css';

function FavoriteCities({ currentCity, onCitySelect }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('favoriteCities');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (city) => {
    let newFavorites;
    if (favorites.includes(city)) {
      newFavorites = favorites.filter(c => c !== city);
    } else {
      newFavorites = [...favorites, city];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteCities', JSON.stringify(newFavorites));
  };

  const isFavorite = (city) => {
    return favorites.includes(city);
  };

  if (!currentCity) return null;

  return (
    <div className="favorite-cities">
      <div className="favorite-toggle">
        <button
          className="favorite-button"
          onClick={() => toggleFavorite(currentCity)}
          aria-label={isFavorite(currentCity) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          {isFavorite(currentCity) ? (
            <FaHeart className="favorite-icon active" />
          ) : (
            <FaRegHeart className="favorite-icon" />
          )}
          <span>{isFavorite(currentCity) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
        </button>
      </div>
      
      {favorites.length > 0 && (
        <div className="favorites-list">
          <h4>Favori Şehirler</h4>
          <div className="favorites-grid">
            {favorites.map((city, index) => (
              <button
                key={index}
                className="favorite-city-item"
                onClick={() => onCitySelect(city)}
              >
                {city}
                <button
                  className="remove-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(city);
                  }}
                  aria-label="Favorilerden çıkar"
                >
                  ×
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoriteCities;

