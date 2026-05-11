import { z } from 'zod'

const SINGLE_ROOM_LIMIT = 3
const DOUBLE_ROOM_LIMIT = 1
const SINGLE_ADULT_CAPACITY = 2
const DOUBLE_ADULT_CAPACITY = 3

export const BookingFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string()
    .min(10, 'Nomor minimal 10 digit')
    .regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid'),
  checkIn: z.string().min(1, 'Tanggal check-in wajib diisi'),
  checkOut: z.string().min(1, 'Tanggal check-out wajib diisi'),
  singleRoomCount: z.coerce.number().min(0, 'Jumlah Single Bed tidak valid'),
  doubleRoomCount: z.coerce.number().min(0, 'Jumlah Double Bed tidak valid'),
  guestCount: z.coerce.number().min(1, 'Minimal 1 tamu dewasa').max(50, 'Maksimal 50 tamu dewasa'),
  breakfast: z.boolean().optional(),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
}).superRefine((data, ctx) => {
  if (!data.checkIn || !data.checkOut) return

  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)

  if (checkOut <= checkIn) {
    ctx.addIssue({
      code: 'custom',
      message: 'Check-out minimal 1 hari setelah check-in',
      path: ['checkOut'],
    })
  }

  const totalRooms = data.singleRoomCount + data.doubleRoomCount
  if (totalRooms < 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'Pilih minimal 1 kamar',
      path: ['singleRoomCount'],
    })
  }

  if (data.singleRoomCount > SINGLE_ROOM_LIMIT) {
    ctx.addIssue({
      code: 'custom',
      message: 'Single Bed maksimal 3 kamar',
      path: ['singleRoomCount'],
    })
  }

  if (data.doubleRoomCount > DOUBLE_ROOM_LIMIT) {
    ctx.addIssue({
      code: 'custom',
      message: 'Double Bed hanya tersedia 1 kamar',
      path: ['doubleRoomCount'],
    })
  }

  const adultCapacity = (data.singleRoomCount * SINGLE_ADULT_CAPACITY) + (data.doubleRoomCount * DOUBLE_ADULT_CAPACITY)
  if (data.guestCount > adultCapacity) {
    ctx.addIssue({
      code: 'custom',
      message: `Maksimal ${adultCapacity} tamu dewasa untuk kombinasi kamar yang dipilih.`,
      path: ['guestCount'],
    })
  }
})

export type BookingFormData = z.infer<typeof BookingFormSchema>
