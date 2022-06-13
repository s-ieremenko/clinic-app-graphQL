import { Context } from '../../index';
import { Day, Doctor, Patient, Prisma } from '@prisma/client';

interface DoctorArgs {
  doctor: {
    name?: string,
    specialization?: string,
    experience?: number | null,
    workingDays?: Day[]
    patients?: Patient[]

  };
}

interface DoctorPayloadType {
  userErrors: {
    message: string
  }[],
  doctor: Doctor | null | Prisma.Prisma__DoctorClient<Doctor>
}

export const doctorResolvers = {
  doctorCreate: async (_: any, { doctor }: DoctorArgs, { prisma, userInfo }: Context): Promise<DoctorPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        doctor: null
      };
    }

    const {
      name,
      specialization,
      experience,
      workingDays
    } = doctor;

    if (!name || !specialization || !experience || !workingDays) {
      return {
        userErrors: [{
          message: 'You must provide all the data to create a doctor'
        }],
        doctor: null

      };
    }


    return {
      userErrors: [],
      doctor: prisma.doctor.create({
        data: {
          name,
          specialization,
          experience,
          workingDays,
          userId: userInfo.userId
        }
      })
    };
  }
};


