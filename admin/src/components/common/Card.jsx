export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-[#0f1117] text-white rounded-xl shadow-sm border border-white/10 ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
