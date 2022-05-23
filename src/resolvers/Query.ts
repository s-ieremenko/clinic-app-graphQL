import { Context, prisma } from '../index';

export const Query = {
  patients: (_: any, __: any, { prisma }: Context) => {

    const patients = prisma.patient.findMany({
      orderBy: [
        // @ts-ignore
        { dateOfBirth: 'desc' }
      ]
    });
    return patients;
  },
  doctors: async (_: any, __: any, { prisma }: Context) => {

    const doctors = await prisma.doctor.findMany({
      orderBy: [
        { experience: 'desc' }
      ]
    });
    return doctors;
  }
};
