import { Context } from '../index';

interface CanUserMutateProfileParams {
  userId: number,
  patientId?: number,
  doctorId?: number,
  prisma: Context['prisma']
}


export const canUserMutateProfile = async ({ userId, patientId, doctorId, prisma }: CanUserMutateProfileParams) => {
  const user = prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    return {
      userErrors: [
        {
          message: 'User not found'
        }
      ],
      patient: null
    };
  }
  let patient, doctor;

  if (patientId) {
    patient = await prisma.patient.findUnique({
      where: {
        id: patientId
      }
    });
  } else if (doctorId) {
    doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId
      }
    });
  }
  if (patient?.userId !== userId && doctor?.userId !== userId) {
    return {
      userErrors: [
        {
          message: 'it"s not your profile"'
        }
      ],
      patient: null
    };
  }

};