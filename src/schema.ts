import { gql } from 'apollo-server';

export const typeDefs = gql`
    scalar Date

    type Query {
        patients: [Patient]!
        doctors: [Doctor]!
        me: User
    }

    type Mutation {
        patientCreate(patient: PatientInput!): PatientPayload!
        patientUpdate(patientId: ID!, patient: PatientInput!): PatientPayload!
        patientDelete(patientId: ID!): PatientPayload!
        doctorCreate(doctor: DoctorInput!): DoctorPayload!
        signup(credentials: CredentialsInput, phoneNumber: String, isDoctor: Boolean!, doctor: DoctorInput, patient: PatientInput): AuthPayload!
        signin(credentials: CredentialsInput): AuthPayload!
        patientChooseDoctor(patientId: ID!,doctorId: ID!, day: String!): PatientPayload!
        patientDeleteDoctor(patientId: ID!,doctorId: ID!): PatientPayload!
        assigmentCreate(assigment: AssigmentInput!, patientId: ID!,doctorId: ID! ): AssigmentPayload
    }

    type User {
        id: ID!
        email: String!
        phoneNumber: String
        isDoctor: Boolean!
        patient: Patient
        doctor: Doctor
    }

    type Patient {
        id: ID!
        name: String!
        address: String!
        phoneNumber: String!
        createdAt: String!
        dateOfBirth: Date!
        doctor: Doctor!
    }

    type Doctor {
        id: ID!
        name: String!
        specialization: String!
        experience: Int!
        workingDays: [Day]!
        createdAt: String!
        patients: [Patient]!
        assigments: [Assigment]!
    }

    type Assigment {
        id: ID!
        procedure: String!
        date: String!
        createdAt: String!
        patient: Patient!
        doctor: Doctor!
    }

    input PatientInput {
        name: String
        address: String
        phoneNumber: String
        dateOfBirth: Date
    }

    input DoctorInput {
        name: String!,
        specialization: String,
        experience: Int,
        workingDays: [Day!]!
    }

    input AssigmentInput {
        procedure: String!
        date: Date!
    }

    type UserError {
        message: String!
    }
    type PatientPayload {
        userErrors: [UserError!]!
        patient: Patient
    }

    type DoctorPayload {
        userErrors: [UserError!]!
        doctor: Doctor
    }

    type AssigmentPayload {
        userErrors: [UserError!]!
        assigment: Assigment
    }

    type AuthPayload {
        userErrors: [UserError!]!
        token: String
    }

    input CredentialsInput {
        email: String!
        password: String!
    }
    enum Day {
        MONDAY
        TUESDAY
        WEDNESDAY
        THURSDAY
        FRIDAY
    }
`;