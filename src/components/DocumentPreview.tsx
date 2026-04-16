import { motion } from 'framer-motion'
import { CreditCard, FileText, User, Hash } from 'lucide-react'

interface DocumentPreviewProps {
  type: 'ine' | 'documento'
}

export function DocumentPreview({ type }: DocumentPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {type === 'ine' ? <INEPreview /> : <DocumentoPreview />}
    </motion.div>
  )
}

function INEPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gris font-medium">Localice su clave electoral en el reverso de su INE:</p>
      
      <motion.div
        initial={{ rotateY: -10 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-6 shadow-2xl overflow-hidden aspect-[1.6/1] max-w-md"
        style={{ perspective: '1000px' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10v20c5.5 0 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-xs font-semibold">INSTITUTO NACIONAL ELECTORAL</p>
              <p className="text-white/60 text-[10px]">CREDENCIAL PARA VOTAR</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/30">
            <span className="text-white/80 font-bold text-lg">MX</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative space-y-3 mt-6">
          {/* QR Section */}
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 bg-white rounded-lg p-1 shadow-lg">
              <div className="w-full h-full bg-gray-900 rounded grid grid-cols-5 gap-0.5 p-1">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'} rounded-sm`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-white/60 text-[10px] mb-1">SECCIÓN • LOCALIDAD • EMISIÓN</p>
              <div className="flex gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">1234</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">01</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">2024</span>
              </div>
            </div>
          </div>

          {/* Clave Electoral - Highlighted */}
          <motion.div
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 20px 5px rgba(255,255,255,0.3)', '0 0 0 0 rgba(255,255,255,0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/95 rounded-xl p-3 mt-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-guinda-primary" />
              <p className="text-[10px] text-guinda-primary font-semibold uppercase tracking-wide">Clave de Elector</p>
            </div>
            <p className="font-mono text-lg font-bold text-negro tracking-wider">
              ABCDEF12345678X123
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-guinda-primary rounded-full animate-pulse"></span>
              <p className="text-[10px] text-gris">Este es el dato que debe ingresar</p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </motion.div>

      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <span className="text-amber-500 text-lg">💡</span>
        <p className="text-sm text-amber-800">
          La clave de elector consta de 18 caracteres alfanuméricos ubicados en el reverso de su credencial.
        </p>
      </div>
    </div>
  )
}

function DocumentoPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gris font-medium">Localice su nombre en su documento oficial:</p>
      
      <motion.div
        initial={{ rotateY: -10 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl overflow-hidden aspect-[1.4/1] max-w-md"
        style={{ perspective: '1000px' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-guinda-primary rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">DOCUMENTO OFICIAL</p>
              <p className="text-white/60 text-[10px]">ESTADOS UNIDOS MEXICANOS</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-guinda-primary/50 flex items-center justify-center">
              <span className="text-white/80 font-bold">🇲🇽</span>
            </div>
          </div>
        </div>

        {/* Photo placeholder */}
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-24 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <User className="w-10 h-10 text-white/40" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-white/50 text-[10px] mb-0.5">FOLIO</p>
              <div className="h-3 bg-white/10 rounded w-24"></div>
            </div>
            <div>
              <p className="text-white/50 text-[10px] mb-0.5">FECHA DE EXPEDICIÓN</p>
              <div className="h-3 bg-white/10 rounded w-20"></div>
            </div>
          </div>
        </div>

        {/* Name - Highlighted */}
        <motion.div
          animate={{ 
            boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 20px 5px rgba(255,255,255,0.3)', '0 0 0 0 rgba(255,255,255,0)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white/95 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-guinda-primary" />
            <p className="text-[10px] text-guinda-primary font-semibold uppercase tracking-wide">Nombre Completo</p>
          </div>
          <p className="text-lg font-semibold text-negro">
            Juan Carlos Pérez García
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-guinda-primary rounded-full animate-pulse"></span>
            <p className="text-[10px] text-gris">Este es el dato que debe ingresar</p>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-guinda-primary/10 rounded-full"></div>
      </motion.div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <span className="text-blue-500 text-lg">📋</span>
        <p className="text-sm text-blue-800">
          Ingrese su nombre completo exactamente como aparece en su documento oficial (incluya apellidos).
        </p>
      </div>
    </div>
  )
}
