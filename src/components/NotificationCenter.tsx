import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReferrals } from '@/hooks/useReferrals';
import { formatCurrency } from '@/lib/referralUtils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { notifications, markNotificationAsRead, refreshData } = useReferrals();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    await refreshData();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'commission_earned':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'payout_processed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'referral_signed_up':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'sale_made':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNotificationData = (notification: any) => {
    if (notification.type === 'commission_earned' && notification.data) {
      return {
        amount: formatCurrency(notification.data.commission_amount || 0),
        saleAmount: formatCurrency(notification.data.sale_amount || 0),
      };
    }
    if (notification.type === 'payout_processed' && notification.data) {
      return {
        amount: formatCurrency(notification.data.amount || 0),
        method: notification.data.method || 'Unknown',
      };
    }
    return {};
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="fixed right-4 top-16 w-96 max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <Card className="border-border/50 bg-gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Stay updated on your referral activity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications && notifications.length > 0 ? (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => {
                    const data = formatNotificationData(notification);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {notification.type === 'commission_earned' && data.amount && (
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                Commission: {data.amount} • Sale: {data.saleAmount}
                              </p>
                            )}
                            {notification.type === 'payout_processed' && data.amount && (
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                Amount: {data.amount} • Method: {data.method}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">You'll see updates about your referrals here</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};