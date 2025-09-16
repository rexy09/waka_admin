interface CustomBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomBadge({ children, variant = 'secondary', size = 'sm' }: CustomBadgeProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap";

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  const variantClasses = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
    orange: "bg-orange-100 text-orange-800 border border-orange-200"
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}