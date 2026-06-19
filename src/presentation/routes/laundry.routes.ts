export const buildLaundryIncidentsPath = (orderId: string) =>
  `/dashboard/laundry/${orderId}/incidents`

export const buildLaundryIncidentDetailPath = (orderId: string, incidentId: string) =>
  `/dashboard/laundry/${orderId}/incidents/${incidentId}`
