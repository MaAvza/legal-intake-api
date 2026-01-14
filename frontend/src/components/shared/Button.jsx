function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, className = '' }) {
  const baseClasses = "font-bold py-3 px-6 rounded-lg transition duration-200"
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  }
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button