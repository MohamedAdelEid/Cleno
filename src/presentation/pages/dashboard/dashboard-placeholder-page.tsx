interface DashboardPlaceholderPageProps {
  title: string
}

export const DashboardPlaceholderPage = ({ title }: DashboardPlaceholderPageProps) => (
  <div className="space-y-2">
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    <p className="text-muted-foreground text-sm">This section is under development.</p>
  </div>
)
