import { Context, prisma } from '../index';

export const Query = {
  patients: (_: any, __: any, { prisma }: Context) => {

    const patients = prisma.patient.findMany({
      orderBy: [
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
  },
  me: (_: any, __: any, { userInfo, prisma }: Context) => {
    if (!userInfo) return null;

    return prisma.user.findUnique({
      where: {
        id: userInfo.userId
      }
    });
  }
};
