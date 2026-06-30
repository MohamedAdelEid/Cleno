export interface CompanyCreateRequestDto {
  businessName: string
  mainContactPerson: string
  phone: string
  photo: string
  email: string
  password: string
  type: string
  address: string
  googleMapLink: string
  commercialRegistration: string | null
  parentCompanyId?: string
}

export type CompanyUpdateRequestDto = Omit<CompanyCreateRequestDto, 'password'> & {
  password?: string
}
