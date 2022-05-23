import { Context } from '../index';


interface FindDoctor {
  doctorId: string;
  prisma: Context['prisma'];
}

export const findDoctor = async ({ doctorId, prisma }: FindDoctor) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: +doctorId
    }
  });

  if (!doctor) {
    return {
      userErrors: [{
        message: 'No doctor found'
      }],
      doctor: null
    };
  }
  return {
    userErrors: [],
    doctor
  };
};