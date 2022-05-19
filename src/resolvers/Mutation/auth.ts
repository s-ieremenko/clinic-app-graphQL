import { Context } from '../../index';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { JSON_SIGNATURE } from '../../key';
import { Day } from '@prisma/client';

interface SignupArgs {
  // credentials: {
  email: string;
  password: string;
  // };
  phoneNumber?: string;
  isDoctor: boolean;
  doctor?: Doctor['doctor'] | null;
  patient?: Patient['patient'] | null;
}

interface Doctor {
  doctor: {
    name: string,
    specialization: string,
    experience: number,
    workingDays: Day[]

  };
}

interface Patient {
  patient: {
    name: string;
    address: string;
    phoneNumber: string
    dateOfBirth: Date
  };
}

interface UserPayload {
  userErrors: {
    message: string
  }[],
  token: string | null
}

export const authResolvers = {
  signup: async (_: any, {
    email,
    password,
    phoneNumber,
    isDoctor,
    doctor,
    patient
  }: SignupArgs, { prisma }: Context): Promise<UserPayload> => {
    // console.log(credentials);
    // const { email, password } = credentials;

    const isEmail = validator.isEmail(email);

    if (!isEmail) {
      return {
        userErrors: [{
          message: 'Invalid email'
        }],
        token: null


      };
    }

    const isValidPassword = validator.isLength(password, {
      min: 5
    });

    if (!isValidPassword) {
      return {
        userErrors: [{
          message: 'Invalid password'
        }],
        token: null


      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    if (!isDoctor && patient) {
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
          token: null

        };
      }
      const birthDate = new Date(dateOfBirth);


      await prisma.patient.create({
        data: {
          ...patient,
          dateOfBirth: birthDate,
          userId: user.id
        }
      });
    } else if (doctor) {
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
          token: null

        };
      }
      await prisma.doctor.create({
        data: {
          ...doctor,
          userId: user.id
        }
      });
    }


    const token = await JWT.sign({
      userId: user.id
    }, JSON_SIGNATURE, {
      expiresIn: 3600000
    });

    return {
      userErrors: [],
      token
    };

  }
};