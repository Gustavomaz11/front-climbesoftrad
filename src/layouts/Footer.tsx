const currentYear = new Date().getFullYear()
export default function Footer() {
  return <footer className="portal-chrome border-t"><div className="flex h-14 items-center justify-between gap-3 bg-card/60 px-4 text-xs text-muted-foreground"><span>© {currentYear} <span className="font-medium text-foreground">ClimbeSoftRad</span>.</span><span>Exames conectados. Cuidado integrado.</span></div></footer>
}
