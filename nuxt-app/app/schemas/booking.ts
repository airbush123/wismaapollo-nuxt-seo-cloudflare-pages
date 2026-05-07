import { z } from 'zod'

export const BookingFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string()
    .min(10, 'Nomor minimal 10 digit')
    .regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid'),
})

export type BookingFormData = z.infer<typeof BookingFormSchema>
