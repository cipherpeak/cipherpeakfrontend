// Update your Navbar component to add Leave Management option
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, User, LogOut, Bell, Calendar, FileText, ChevronRight, Megaphone, Plus, Eye, Mail, Briefcase, Phone, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "../../assets/cipher_peak full.png"
import { logout, updateUserInfo } from '../../Redux/slices/authSlice';
import axiosInstance from '../../axios/axios';
import { requests } from '../../lib/urls';
import { RootState } from '../../Redux/Store';

interface NavbarProps {
}

const Navbar = ({ }: NavbarProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', description: '' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const user = useSelector((state: RootState) => state.auth.user);

  const isAdmin = user === 'admin' || user === 'superuser' || (typeof user === 'object' && (user.is_superuser || ['admin', 'superuser'].includes(user.role)));

  const getFullName = () => {
    if (!userInfo) return "Guest User";
    return `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || userInfo.username || "User";
  };

  const getInitials = () => {
    if (!userInfo) return "GU";
    const first = userInfo.first_name?.[0] || '';
    const last = userInfo.last_name?.[0] || '';
    return (first + last).toUpperCase() || userInfo.username?.[0]?.toUpperCase() || "U";
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post(requests.Logout);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      if (isAdmin) {
        const res = await axiosInstance.get(requests.AdminLeaveList);
        const pendingLeaves = (Array.isArray(res.data) ? res.data : (res.data.results || []))
          .filter((l: any) => l.status === 'pending');
        setNotifications(pendingLeaves.map((l: any) => ({
          id: l.id,
          title: `Leave Request: ${l.employee_name || l.employee_details?.employee_id || 'Unknown'}`,
          description: `${l.leave_type || 'Leave'} from ${l.start_date} to ${l.end_date}`,
          type: 'leave',
          link: `/leave-applications?id=${l.id}`
        })));
      } else {
        const res = await axiosInstance.get(requests.AnnouncementList);
        const announcements = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setNotifications(announcements.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          type: 'announcement'
        })));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [userInfo]);

  // Fetch full profile details when modal opens if data is missing
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (isProfileModalOpen && !isAdmin && userInfo?.id && (!userInfo.joining_date || !userInfo.phone_number)) {
        try {
          // Try to fetch specific employee details
          // We need to know which endpoint to use. Based on Employees.tsx it is auth/employees/${id}/
          const res = await axiosInstance.get(`auth/employees/${userInfo.id}/`);
          dispatch(updateUserInfo(res.data));
        } catch (error) {
          console.error("Failed to fetch profile details:", error);
        }
      }
    };

    fetchProfileDetails();
  }, [isProfileModalOpen, isAdmin, userInfo?.id]);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post(requests.AnnouncementCreate, {
        title: announcementForm.title,
        description: announcementForm.description,
      });
      toast.success("Announcement posted successfully!");
      setIsAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', description: '' });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to post announcement:", error);
      toast.error("Failed to post announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center">
            <img src={logo} alt="" onClick={() => navigate('/')} className="cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-danger-foreground text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex justify-between items-center">
              Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">{notifications.length} New</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={`${notif.type}-${notif.id}`}
                    className="flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      if (notif.type === 'announcement') {
                        setSelectedAnnouncement(notif);
                        setIsDetailsModalOpen(true);
                      } else if (notif.link) {
                        navigate(notif.link);
                      }
                    }}
                  >
                    <div className="flex justify-between w-full mb-1">
                      <span className="text-sm font-bold text-foreground">{notif.title}</span>
                      <Badge variant="outline" className="text-[8px] uppercase">
                        {notif.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                    {(notif.link || notif.type === 'announcement') && (
                      <span className="text-[10px] text-primary mt-2 flex items-center gap-1 font-medium group-hover:underline">
                        <Eye className="h-3 w-3" /> View Details <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </div>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-center justify-center text-xs text-primary font-medium p-2 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => navigate('/leave-applications')}
                >
                  View All Requests
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userInfo?.profile_image_url || "/placeholder-avatar.jpg"} alt="User" />
                <AvatarFallback className="bg-[#4D4D4D] hover:bg-[#4D4D4D] hover:text-[#ffff] text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getFullName()}</p>
                <p className="text-xs leading-none text-muted-foreground">{userInfo?.email || 'No email'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => setIsAnnouncementModalOpen(true)}>
                <Megaphone className="mr-2 h-4 w-4" />
                <span>Add Announcement</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Announcement Modal */}
        <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Add New Announcement
              </DialogTitle>
              <DialogDescription>
                This announcement will be shown as a notification to all employees.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAnnouncement}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter announcement description"
                    rows={4}
                    value={announcementForm.description}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAnnouncementModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Announcement Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                {selectedAnnouncement?.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Announcement Details
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedAnnouncement?.description}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Profile Modal */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                User Profile
              </DialogTitle>
              <DialogDescription>
                Basic information about your account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-border/50 shadow-sm">
                  <AvatarImage src={userInfo?.profile_image_url || "/placeholder-avatar.jpg"} alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold">{getFullName()}</h3>
                  <Badge variant="secondary" className="capitalize px-3 py-1 font-normal">
                    {typeof user === 'string' ? user : user?.role || 'Employee'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Email</span>
                    <span className="font-medium truncate">{userInfo?.email || 'N/A'}</span>
                  </div>
                </div>

                {!isAdmin && (
                  <>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Phone</span>
                        <span className="font-medium">{userInfo?.phone_number || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Department</span>
                        <span className="font-medium">{userInfo?.department || 'General'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Join Date</span>
                        <span className="font-medium">
                          {userInfo?.joining_date ? new Date(userInfo.joining_date).toLocaleDateString() :
                            userInfo?.date_joined ? new Date(userInfo.date_joined).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Address</span>
                        <span className="font-medium text-wrap">
                          {[
                            userInfo?.address,
                            userInfo?.city,
                            userInfo?.state,
                            userInfo?.country
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsProfileModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navbar;