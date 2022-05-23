import { Context } from '../index';

interface IsPatientExisting {
  patientId: string,
  prisma: Context['prisma']
}


export const isPatientExisting = async ({ patientId, prisma }: IsPatientExisting) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id: +patientId
    }
  });

  if (!patient) {
    return {
      userErrors: [{
        message: 'No patient found'
      }],
      patient: null
    };
  }
};