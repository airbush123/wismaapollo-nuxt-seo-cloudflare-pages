import { z } from 'zod'

const getRoomLimit = (roomType: 'single' | 'double') => roomType === 'single' ? 3 : 1

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
  roomCount: z.coerce.number().min(1, 'Minimal 1 kamar'),
  guestCount: z.coerce.number().min(1, 'Minimal 1 tamu').max(50, 'Maksimal 50 tamu'),
  breakfast: z.boolean().optional(),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
}).superRefine((data, ctx) => {
  if (!data.checkIn || !data.checkOut) return true

  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)

  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: 'custom',
      message: 'Check-out minimal 1 hari setelah check-in',
      path: ['checkOut'],
    })
  }

  const roomLimit = getRoomLimit(data.roomType)
  if (data.roomCount > roomLimit) {
    ctx.addIssue({
      code: 'custom',
      message: data.roomType === 'single'
        ? 'Single Bed maksimal 3 kamar'
        : 'Double Bed hanya tersedia 1 kamar',
      path: ['roomCount'],
    })
  }
})

export type BookingFormData = z.infer<typeof BookingFormSchema>
