const FinancialDisclaimer = ({ className = "" }: { className?: string }) => (
  <p className={`text-[11px] text-muted-foreground/70 leading-snug mt-4 ${className}`}>
    FinBloom is not a financial advisor. All content is for informational and educational purposes only.
  </p>
);

export default FinancialDisclaimer;
