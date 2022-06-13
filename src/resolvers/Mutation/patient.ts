import { Context } from '../../index';
import { Day, Doctor, Patient, Prisma } from '@prisma/client';
import { canUserMutateProfile } from '../../utils/canUserMutateProfile';
import { isPatientExisting } from '../../utils/isPatientExisting';
import { findDoctor } from '../../utils/findDoctor';

interface PatientArgs {
  patient: {
    name?: string;
    address?: string;
    phoneNumber?: string
    dateOfBirth?: Date
  };
}

export interface PatientPayloadType {
  userErrors: {
    message: string
  }[],
  patient: Patient | Prisma.Prisma__PatientClient<Patient> | null
}

export interface DoctorPayloadType {
  userErrors: {
    message: string
  }[],
  doctor: Doctor | Prisma.Prisma__DoctorClient<Doctor> | null
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

    const patientResult = await isPatientExisting({ patientId, prisma });

    if (patientResult.userErrors.length) return patientResult;

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
    const error = await canUserMutateProfile({
      userId: userInfo.userId,
      patientId: +patientId,
      prisma
    });

    if (error) return error;

    const patientResult = await isPatientExisting({ patientId, prisma });

    if (patientResult.userErrors.length) return patientResult;

    return {
      userErrors: [],
      patient: prisma.patient.delete({
        where: {
          id: +patientId
        }
      })
    };

  },
  patientChooseDoctor: async (_: any, {
    patientId,
    doctorId,
    day
  }: { patientId: string, doctorId: string, day: Day }, {
                                userInfo,
                                prisma
                              }: Context): Promise<PatientPayloadType | DoctorPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }
    const patientResult = await isPatientExisting({ patientId, prisma });

    if (patientResult.userErrors.length) return patientResult;

    const doctorResult = await findDoctor({ doctorId, prisma });
    if (doctorResult.userErrors.length) return doctorResult;

    if (!doctorResult?.doctor?.workingDays.includes(day)) {
      return {
        userErrors: [{
          message: 'Doctor doesn"t work that day'
        }],
        patient: null
      };
    }

    return {
      userErrors: [],
      patient: prisma.patient.update({
        where: {
          id: +patientId
        },
        data: {
          doctors: {
            connect: [{ id: +doctorId }]
          }
        }
      })
    };
  },
  patientDeleteDoctor: async (_: any, {
    patientId,
    doctorId
  }: { patientId: string, doctorId: string }, {
                                userInfo,
                                prisma
                              }: Context): Promise<PatientPayloadType | DoctorPayloadType> => {
    if (!userInfo) {
      return {
        userErrors: [{
          message: 'Forbidden access(unauthenticated)'
        }],
        patient: null
      };
    }
    const patientResult = await isPatientExisting({ patientId, prisma });

    if (patientResult.userErrors.length) return patientResult;

    const doctorResult = await findDoctor({ doctorId, prisma });
    if (doctorResult.userErrors.length) return doctorResult;


    const updatedPatient = await prisma.patient.update({
      where: {
        id: +patientId
      },
      data: {
        doctors: {
          disconnect: [{ id: +doctorId }]
        }
      }
    });

    return {
      userErrors: [],
      patient: updatedPatient
    };
  }
};


