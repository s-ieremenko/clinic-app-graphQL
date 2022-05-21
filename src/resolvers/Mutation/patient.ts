import { Context } from '../../index';
import { Day, Patient, Prisma } from '@prisma/client';
import { canUserMutateProfile } from '../../utils/canUserMutateProfile';

interface PatientArgs {
  patient: {
    name?: string;
    address?: string;
    phoneNumber?: string
    dateOfBirth?: Date

  };
}

interface PatientPayloadType {
  userErrors: {
    message: string
  }[],
  patient: Patient | Prisma.Prisma__PatientClient<Patient> | null
}

export const patientResolvers = {
  patientCreate: async (_: any, { patient }: PatientArgs, {
    prisma,
    userInfo
  }: Context): Promise<PatientPayloadType> => {

    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }

    const {
      name,
      address,
      phoneNumber,
      dateOfBirth
    } = patient;

    if (!name || !address || !phoneNumber || !dateOfBirth) {
      return {
        userErrors: [{
          message: 'You must provide all the data to create a patient'
        }],
        patient: null

      };
    }
    const birthDate = new Date(dateOfBirth);

    return {
      userErrors: [],
      patient: prisma.patient.create({
        data: {
          name,
          address,
          phoneNumber,
          dateOfBirth: birthDate,
          userId: userInfo.userId
        }
      })
    };
  },
  patientUpdate: async (_: any, {
    patientId,
    patient
  }: { patientId: string, patient: PatientArgs['patient'] }, {
                          prisma,
                          userInfo
                        }: Context): Promise<PatientPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }

    const error = await canUserMutateProfile({
      userId: userInfo.userId,
      patientId: +patientId,
      prisma
    });

    if (error) return error;

    const {
      name,
      address,
      phoneNumber
    } = patient;

    if (!name! && !address && !phoneNumber) {
      return {
        userErrors: [{
          message: 'Need to have at least one field to update'
        }],
        patient: null
      };
    }

    const patientExist = await prisma.patient.findUnique({
      where: {
        id: +patientId
      }
    });
    if (!patientExist) {
      return {
        userErrors: [{
          message: 'No patient found'
        }],
        patient: null
      };
    }

    let payloadToUpdate = {
      name,
      address,
      phoneNumber
    };
    if (!name) delete payloadToUpdate.name;
    if (!address) delete payloadToUpdate.address;
    if (!phoneNumber) delete payloadToUpdate.phoneNumber;


    return {
      userErrors: [],
      patient: prisma.patient.update({
        data: {
          ...payloadToUpdate
        },
        where: {
          id: +patientId
        }
      })
    };

  },
  patientDelete: async (_: any, { patientId }: { patientId: string }, {
    prisma,
    userInfo
  }: Context): Promise<PatientPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }

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

    await prisma.patient.delete({
      where: {
        id: +patientId
      }
    });
    return {
      userErrors: [],
      patient
    };
  },
  makeAnAppointment: async (_: any, {
    patientId,
    doctorId,
    day
  }: { patientId: string, doctorId: string, day: Day }, { userInfo, prisma }: Context) => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }

    // const patient = await prisma.patient.findUnique({
    //   where: {
    //     id: +patientId
    //   }
    // });
    // if (!patient) {
    //   return {
    //     userErrors: [{
    //       message: 'No patient found'
    //     }],
    //     patient: null
    //   };
    // }

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
        patient: null
      };
    }
    // @ts-ignore


    return {
      userErrors: [],
      patient: prisma.patient.update({
        where: {
          id: +patientId
        },
        data: {
          doctors: {
            // @ts-ignore
            connect: { doctorId: +doctorId }
          }
        }
      })
    };
  }
};


