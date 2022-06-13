import { Context } from '../../index';
import { Assigment, Prisma } from '@prisma/client';
import { isPatientExisting } from '../../utils/isPatientExisting';
import { findDoctor } from '../../utils/findDoctor';
import { DoctorPayloadType, PatientPayloadType } from './patient';


interface AssigmentArgs {
  assigment: {
    procedure: string;
    date: Date
  };
  patientId: string;
  doctorId: string;
}

interface AssigmentPayloadType {
  userErrors: {
    message: string
  }[];
  assigment: Assigment | Prisma.Prisma__AssigmentClient<Assigment> | null;
}

export const assigmentResolvers = {
  assigmentCreate: async (_: any, { assigment, patientId, doctorId }: AssigmentArgs, {
    prisma, userInfo
  }: Context): Promise<AssigmentPayloadType | PatientPayloadType | DoctorPayloadType> => {

    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        assigment: null
      };
    }
    const patientResult = await isPatientExisting({ patientId, prisma });

    if (patientResult.userErrors.length) return patientResult;


    const doctorResult = await findDoctor({ doctorId, prisma });
    if (doctorResult.userErrors.length) return doctorResult;

    if (userInfo.userId !== doctorResult?.doctor?.userId) {
      return {
        userErrors: [{
          message: 'Assigments can be done only by doctors'
        }],
        assigment: null
      };
    } else {

      const doctorIds = patientResult?.patient?.doctors.map(doctor => doctor.id);

      if (!doctorIds?.includes(+doctorId)) {
        return {
          userErrors: [{
            message: 'It is not your patient'
          }],
          assigment: null
        };
      }
    }


    const { procedure, date } = assigment;

    if (!procedure || !date) {
      return {
        userErrors: [{
          message: 'All the fields required'
        }],
        assigment: null
      };
    }

    const dateOfProcedure = new Date(date);

    return {
      userErrors: [],
      assigment: prisma.assigment.create({
        data: {
          ...assigment,
          date: dateOfProcedure,
          doctor: {
            connect: { id: +doctorId }
          },
          patient: {
            connect: { id: +patientId }
          }
        }
      })
    };
  }
};
