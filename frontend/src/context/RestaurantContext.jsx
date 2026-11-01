import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [switchSuccessMessage, setSwitchSuccessMessage] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [switching, setSwitching] = useState(false);

  // Counter to force re-fetching in sub-components when restaurant switches
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch authorized restaurants for the user
  const fetchMyRestaurants = useCallback(async () => {
    if (!user || (user.role !== 'restaurant_owner' && user.role !== 'admin')) {
      setActiveRestaurant(null);
      setAvailableRestaurants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/restaurant/my-restaurants');
      if (res.data.success) {
        const list = res.data.restaurants || [];
        setAvailableRestaurants(list);

        const savedId = localStorage.getItem('dineeasy_active_restaurant_id');
        let current = null;

        if (savedId) {
          current = list.find((r) => r._id === savedId || r.restaurantCode === savedId);
        }

        if (!current && list.length > 0) {
          current = list.find((r) => r.isCurrent) || list[0];
        }

        if (current) {
          setActiveRestaurant(current);
          localStorage.setItem('dineeasy_active_restaurant_id', current._id);
        }
      }
    } catch (err) {
      console.error('Failed to load authorized restaurants:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRestaurants();
  }, [fetchMyRestaurants]);

  // Switch restaurant method
  const switchRestaurant = async (targetRestaurantId) => {
    try {
      setSwitching(true);
      setSwitchError('');
      const res = await api.post(`/restaurant/switch/${targetRestaurantId}`);

      if (res.data.success) {
        const newRest = res.data.restaurant;
        setActiveRestaurant(newRest);
        localStorage.setItem('dineeasy_active_restaurant_id', newRest._id);

        const successText = res.data.message || `You are now managing ${newRest.name}.`;
        setSwitchSuccessMessage(successText);

        // Update list so isCurrent reflects the switch
        setAvailableRestaurants((prev) =>
          prev.map((r) => ({
            ...r,
            isCurrent: r._id === newRest._id,
          }))
        );

        // Increment trigger to notify all child pages to refresh their data
        setRefreshTrigger((prev) => prev + 1);

        setTimeout(() => {
          setSwitchSuccessMessage('');
          setIsSwitchModalOpen(false);
        }, 1200);

        return { success: true, restaurant: newRest };
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Access denied. You cannot switch to this restaurant.';
      setSwitchError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setSwitching(false);
    }
  };

  const openSwitchModal = () => {
    setSwitchError('');
    setSwitchSuccessMessage('');
    setIsSwitchModalOpen(true);
    fetchMyRestaurants();
  };

  const closeSwitchModal = () => {
    setIsSwitchModalOpen(false);
    setSwitchError('');
    setSwitchSuccessMessage('');
  };

  return (
    <RestaurantContext.Provider
      value={{
        activeRestaurant,
        availableRestaurants,
        loading,
        switching,
        refreshTrigger,
        switchSuccessMessage,
        switchError,
        isSwitchModalOpen,
        openSwitchModal,
        closeSwitchModal,
        switchRestaurant,
        refreshMyRestaurants: fetchMyRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useActiveRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useActiveRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export default RestaurantContext;

