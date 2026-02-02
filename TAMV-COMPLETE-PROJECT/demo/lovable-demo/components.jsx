import React from 'react';

// UI Components for TAMV Demo
// These are simplified versions of shadcn/ui components for the demo

export const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  className = "", 
  variant = "default", 
  size = "default",
  disabled = false,
  onClick,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, className = "" }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

export const Progress = ({ value = 0, className = "" }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div 
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </div>
);

// Additional utility components for the demo
export const LoadingSpinner = ({ className = "" }) => (
  <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}>
    <span className="sr-only">Loading...</span>
  </div>
);

export const GradientText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

export const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

export const FloatingCard = ({ children, className = "" }) => (
  <div className={`transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

export const GlowEffect = ({ children, color = "purple" }) => {
  const glowColors = {
    purple: "shadow-purple-500/25",
    blue: "shadow-blue-500/25",
    green: "shadow-green-500/25",
    red: "shadow-red-500/25",
  };
  
  return (
    <div className={`relative group`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt`}></div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export const TypewriterText = ({ text, speed = 50 }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);
  
  return <span>{displayText}</span>;
};

export const PulsingDot = ({ color = "blue" }) => (
  <div className="relative">
    <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
    <div className={`absolute top-0 left-0 w-3 h-3 bg-${color}-500 rounded-full animate-ping`}></div>
  </div>
);

export const StatsCard = ({ icon, value, label, trend, color = "blue" }) => (
  <Card className={`bg-gradient-to-br from-${color}-500 to-${color}-600 border-0 text-white hover:scale-105 transition-transform duration-300`}>
    <CardContent className="p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-sm opacity-90 mb-2">{label}</div>
      {trend && (
        <Badge className="bg-white/20 text-white text-xs">
          {trend}
        </Badge>
      )}
    </CardContent>
  </Card>
);

export const FeatureHighlight = ({ icon, title, description, features = [] }) => (
  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-4xl">{icon}</div>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          Activo
        </Badge>
      </div>
      <CardTitle className="text-white text-xl mb-2">{title}</CardTitle>
      <p className="text-gray-300 text-sm">{description}</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {features.map((feature, idx) => (
          <div key={idx} className="text-xs text-gray-400 flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
            {feature}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const MetricDisplay = ({ number, label, trend, color, icon }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    cyan: "from-cyan-500 to-cyan-600"
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border-0 text-white hover:scale-105 transition-transform duration-300`}>
      <CardContent className="p-6 text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-3xl font-bold mb-2">
          <AnimatedCounter value={parseInt(number.replace(/[^\d]/g, ''))} />
          {number.replace(/[\d]/g, '')}
        </div>
        <div className="text-sm opacity-90 mb-2">{label}</div>
        {trend && (
          <Badge className="bg-white/20 text-white text-xs">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const InteractiveButton = ({ children, onClick, variant = "primary", size = "default", className = "" }) => {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    warning: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
    outline: "border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm"
  };

  return (
    <button
      onClick={onClick}
      className={`${variants[variant]} text-white px-8 py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl ${className}`}
    >
      {children}
    </button>
  );
};

export const ServiceCard = ({ service }) => (
  <FeatureHighlight
    icon={service.icon}
    title={service.name}
    description={service.description}
    features={service.features}
  />
);

export const RegionCard = ({ region }) => (
  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center hover:scale-105 transition-transform duration-300">
    <div className="text-6xl mb-4">{region.flag}</div>
    <h3 className="text-2xl font-bold mb-4 text-indigo-300">{region.name}</h3>
    <div className="space-y-3">
      <div>
        <div className="text-3xl font-bold text-white">{region.countries}</div>
        <div className="text-sm text-gray-400">Países Activos</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-blue-400">{region.users}</div>
        <div className="text-sm text-gray-400">Usuarios</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-green-400">{region.revenue}</div>
        <div className="text-sm text-gray-400">Ingresos Mensuales</div>
      </div>
    </div>
  </Card>
);

// Export all components
export default {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Progress,
  LoadingSpinner,
  GradientText,
  AnimatedCounter,
  FloatingCard,
  GlowEffect,
  TypewriterText,
  PulsingDot,
  StatsCard,
  FeatureHighlight,
  MetricDisplay,
  InteractiveButton,
  ServiceCard,
  RegionCard
};