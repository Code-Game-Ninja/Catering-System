import { Badge } from "@/components/ui/badge"
import { CreditCard, Banknote } from "lucide-react"

interface PaymentMethodBadgeProps {
  method: string
  className?: string
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  if (method === "cod") {
    return (
      <Badge className={`bg-green-500/20 text-green-400 border-green-400/20 ${className}`}>
        <Banknote className="mr-1 h-3 w-3" />
        Cash on Delivery
      </Badge>
    )
  }

  return (
    <Badge className={`bg-blue-500/20 text-blue-400 border-blue-400/20 ${className}`}>
      <CreditCard className="mr-1 h-3 w-3" />
      Card Payment
    </Badge>
  )
}
