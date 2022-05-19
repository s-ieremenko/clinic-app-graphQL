import { patientResolvers } from './patient';
import { doctorResolvers } from './doctor';
import { authResolvers } from './auth';

export const Mutation = {
  ...patientResolvers,
  ...doctorResolvers,
  ...authResolvers
};