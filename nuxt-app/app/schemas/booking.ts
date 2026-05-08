import { z } from 'zod'

export const BookingFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string()
    .min(10, 'Nomor minimal 10 digit')
    .regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid'),
  checkIn: z.string().min(1, 'Tanggal check-in wajib diisi'),
  checkOut: z.string().min(1, 'Tanggal check-out wajib diisi'),
  roomType: z.enum(['single', 'double'], {
    message: 'Pilih tipe kamar',
  }),
  roomCount: z.coerce.number().min(1, 'Minimal 1 kamar').max(20, 'Maksimal 20 kamar'),
  guestCount: z.coerce.number().min(1, 'Minimal 1 tamu').max(50, 'Maksimal 50 tamu'),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
}).refine((data) => {
  if (!data.checkIn || !data.checkOut) return true
  return new Date(data.checkOut) >= new Date(data.checkIn)
}, {
  message: 'Check-out tidak boleh sebelum check-in',
  path: ['checkOut'],
})

export type BookingFormData = z.infer<typeof BookingFormSchema>
