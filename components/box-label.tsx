"use client"

import { forwardRef } from "react"
import Barcode from "react-barcode"
import { QRCodeSVG } from "qrcode.react"
import type { Box, DocumentType } from "@/lib/types"

const documentTypeLabels: Record<DocumentType, string> = {
  financeiro: "Financeiro",
  rh: "RH",
  contratos: "Contratos",
  assistencial: "Assistencial",
  administrativo: "Administrativo",
  juridico: "Jurídico",
}

interface BoxLabelProps {
  box: Box
}

export const BoxLabel = forwardRef<HTMLDivElement, BoxLabelProps>(
  ({ box }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] bg-white p-6 text-black print:w-full print:p-4"
      >
        {/* Header */}
        <div className="mb-4 border-b-2 border-black pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">ARQUIVO MORTO</h1>
              <p className="text-xs text-gray-600">Sistema de Gestao Documental</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">{box.code}</p>
            </div>
          </div>
        </div>

        {/* QR Code and Barcode */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-col items-center">
            <QRCodeSVG
              value={`BOX:${box.code}|BC:${box.barcode}|SECTOR:${box.sector}`}
              size={80}
              level="M"
            />
            <p className="mt-1 text-[8px] text-gray-500">QR Code</p>
          </div>
          <div className="flex flex-col items-center">
            <Barcode
              value={box.barcode}
              width={1.2}
              height={40}
              fontSize={10}
              margin={0}
              displayValue={true}
            />
          </div>
        </div>

        {/* Box Details */}
        <div className="mb-3 space-y-2 border-t border-gray-300 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-gray-600">SETOR</p>
              <p className="font-bold">{box.sector}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">UNIDADE</p>
              <p className="font-bold">{box.unit}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600">TIPO DOCUMENTAL</p>
            <p className="text-sm font-bold">{documentTypeLabels[box.documentType]}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600">DESCRICAO</p>
            <p className="line-clamp-2 text-xs">{box.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold text-gray-600">PERIODO</p>
              <p className="font-bold">
                {box.startDate} a {box.endDate}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">RESPONSAVEL</p>
              <p className="font-bold">{box.responsible}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border-t border-gray-300 pt-3">
          <p className="text-xs font-semibold text-gray-600">LOCALIZACAO</p>
          <p className="text-xs font-bold leading-tight">{box.locationPath}</p>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t-2 border-black pt-2">
          <div className="flex items-center justify-between text-[9px] text-gray-500">
            <p>Arquivado em: {box.archiveDate}</p>
            <p>Descarte previsto: {box.expectedDiscardDate}</p>
          </div>
        </div>
      </div>
    )
  }
)

BoxLabel.displayName = "BoxLabel"

interface PrintableLabelProps {
  box: Box
  onClose: () => void
}

export function PrintableLabel({ box, onClose }: PrintableLabelProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="flex justify-center rounded-lg border border-border bg-muted/50 p-6">
        <BoxLabel box={box} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Fechar
        </button>
        <button
          onClick={handlePrint}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Imprimir Etiqueta
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-label,
          .print-label * {
            visibility: visible;
          }
          .print-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
