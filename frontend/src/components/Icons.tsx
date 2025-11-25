// Centralized Icon components using lucide-react-native
import React from 'react';
import {
  Home,
  Search,
  Ticket,
  User,
  Calendar,
  Clock,
  DoorOpen,
  Film,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  Settings,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  CreditCard,
  QrCode,
  Play,
  Pause,
  Heart,
  Share2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Menu,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Image,
  Video,
  MapPin,
  Armchair,
  CalendarPlus,
  CalendarClock,
  CalendarX,
  Banknote,
  CircleDollarSign,
  TicketCheck,
  Clapperboard,
  Popcorn,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  UserCircle,
  Users,
  UserPlus,
  PersonStanding,
} from 'lucide-react-native';

// Icon wrapper for consistent styling
interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

// Home & Navigation
export const HomeIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Home size={size} color={color} style={style} />
);

export const SearchIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Search size={size} color={color} style={style} />
);

export const TicketIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Ticket size={size} color={color} style={style} />
);

export const UserIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <User size={size} color={color} style={style} />
);

export const UsersIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Users size={size} color={color} style={style} />
);

// Calendar & Time
export const CalendarIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Calendar size={size} color={color} style={style} />
);

export const ClockIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Clock size={size} color={color} style={style} />
);

export const CalendarPlusIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CalendarPlus size={size} color={color} style={style} />
);

export const CalendarClockIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CalendarClock size={size} color={color} style={style} />
);

export const CalendarXIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CalendarX size={size} color={color} style={style} />
);

// Movie & Entertainment
export const FilmIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Film size={size} color={color} style={style} />
);

export const StarIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Star size={size} color={color} style={style} />
);

export const PlayIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Play size={size} color={color} style={style} />
);

export const ClapperboardIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Clapperboard size={size} color={color} style={style} />
);

// Room & Seats
export const DoorIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <DoorOpen size={size} color={color} style={style} />
);

export const SeatIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Armchair size={size} color={color} style={style} />
);

// Navigation arrows
export const ArrowLeftIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ArrowLeft size={size} color={color} style={style} />
);

export const ArrowRightIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ArrowRight size={size} color={color} style={style} />
);

export const ChevronLeftIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ChevronLeft size={size} color={color} style={style} />
);

export const ChevronRightIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ChevronRight size={size} color={color} style={style} />
);

export const ChevronDownIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ChevronDown size={size} color={color} style={style} />
);

export const ChevronUpIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <ChevronUp size={size} color={color} style={style} />
);

// Actions
export const PlusIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Plus size={size} color={color} style={style} />
);

export const MinusIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Minus size={size} color={color} style={style} />
);

export const CloseIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <X size={size} color={color} style={style} />
);

export const CheckIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Check size={size} color={color} style={style} />
);

export const EditIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Edit size={size} color={color} style={style} />
);

export const TrashIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Trash2 size={size} color={color} style={style} />
);

export const SettingsIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Settings size={size} color={color} style={style} />
);

export const LogOutIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <LogOut size={size} color={color} style={style} />
);

export const RefreshIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <RefreshCw size={size} color={color} style={style} />
);

export const MenuIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Menu size={size} color={color} style={style} />
);

export const MoreIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <MoreVertical size={size} color={color} style={style} />
);

export const FilterIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Filter size={size} color={color} style={style} />
);

// Auth & User
export const MailIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Mail size={size} color={color} style={style} />
);

export const LockIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Lock size={size} color={color} style={style} />
);

export const EyeIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Eye size={size} color={color} style={style} />
);

export const EyeOffIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <EyeOff size={size} color={color} style={style} />
);

export const PhoneIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Phone size={size} color={color} style={style} />
);

export const UserCircleIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <UserCircle size={size} color={color} style={style} />
);

export const PersonIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <PersonStanding size={size} color={color} style={style} />
);

// Payment
export const CreditCardIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CreditCard size={size} color={color} style={style} />
);

export const MoneyIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Banknote size={size} color={color} style={style} />
);

export const DollarIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CircleDollarSign size={size} color={color} style={style} />
);

export const QrCodeIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <QrCode size={size} color={color} style={style} />
);

export const TicketCheckIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <TicketCheck size={size} color={color} style={style} />
);

// Status & Alerts
export const AlertIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <AlertCircle size={size} color={color} style={style} />
);

export const AlertTriangleIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <AlertTriangle size={size} color={color} style={style} />
);

export const InfoIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Info size={size} color={color} style={style} />
);

export const HelpIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <HelpCircle size={size} color={color} style={style} />
);

export const SuccessIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <CheckCircle size={size} color={color} style={style} />
);

export const ErrorIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <XCircle size={size} color={color} style={style} />
);

export const LoadingIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Loader size={size} color={color} style={style} />
);

// Social & Misc
export const HeartIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Heart size={size} color={color} style={style} />
);

export const ShareIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Share2 size={size} color={color} style={style} />
);

export const BookmarkIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Bookmark size={size} color={color} style={style} />
);

export const ImageIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <Image size={size} color={color} style={style} />
);

export const LocationIcon = ({ size = 24, color = '#fff', style }: IconProps) => (
  <MapPin size={size} color={color} style={style} />
);

// Re-export raw lucide icons for direct use
export {
  Home,
  Search,
  Ticket,
  User,
  Calendar,
  Clock,
  DoorOpen,
  Film,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  Settings,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  CreditCard,
  QrCode,
  Play,
  Heart,
  Share2,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Menu,
  Filter,
  RefreshCw,
  Armchair,
  CalendarPlus,
  CalendarClock,
  CalendarX,
  Banknote,
  CircleDollarSign,
  TicketCheck,
  Clapperboard,
  Info,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  UserCircle,
  Users,
  PersonStanding,
  Flame,
  Flame as Fire,
  PlayCircle,
  CalendarRange,
} from 'lucide-react-native';
