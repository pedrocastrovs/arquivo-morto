import type { Loan } from "@/lib/types"

export interface LoanStatusCounts {
  all: number
  pendente: number
  em_andamento: number
  atrasado: number
  devolvido: number
}

export function computeLoanStatusCounts(loans: Loan[]): LoanStatusCounts {
  return {
    all: loans.length,
    pendente: loans.filter((l) => l.status === "pendente").length,
    em_andamento: loans.filter((l) => l.status === "em_andamento").length,
    atrasado: loans.filter((l) => l.status === "atrasado").length,
    devolvido: loans.filter((l) => l.status === "devolvido").length,
  }
}
