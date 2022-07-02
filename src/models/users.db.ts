import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { SkylabError } from "src/errors/SkylabError";
import { getCurrentCohort } from "src/helpers/cohorts.helper";
import { HttpStatusCode } from "src/utils/HTTP_Status_Codes";

const prisma = new PrismaClient();

export async function findFirstUser(query: Prisma.UserFindFirstArgs) {
  const firstUser = await prisma.user.findFirst({
    ...query,
    rejectOnNotFound: false,
  });
  if (!firstUser) {
    throw new SkylabError("User was not found", HttpStatusCode.BAD_REQUEST);
  }
  return firstUser;
}

export async function findUniqueUser(query: Prisma.UserFindUniqueArgs) {
  const uniqueUser = await prisma.user.findFirst({
    ...query,
    rejectOnNotFound: false,
  });
  if (!uniqueUser) {
    throw new SkylabError("User was not found", HttpStatusCode.BAD_REQUEST);
  }
  return uniqueUser;
}

export async function findUniqueUserWithRoleData(
  query: Omit<Prisma.UserFindUniqueArgs, "include">
) {
  const { academicYear } = await getCurrentCohort();
  const user = await prisma.user.findUnique({
    ...query,
    include: {
      student: {
        where: { cohortYear: academicYear },
      },
      mentor: {
        where: { cohortYear: academicYear },
      },
      adviser: { where: { cohortYear: academicYear } },
    },
    rejectOnNotFound: false,
  });
  if (!user) {
    throw new SkylabError("User was not found", HttpStatusCode.BAD_REQUEST);
  }
  return user;
}

export async function findManyUsers(query: Prisma.UserFindManyArgs) {
  const manyUsers = await prisma.user.findMany(query);
  return manyUsers;
}

export async function findManyUsersWithRoleInCohort(
  query: Omit<Prisma.UserFindManyArgs, "include">,
  cohortYear: number
) {
  const manyUsers = await prisma.user.findMany({
    ...query,
    include: {
      student: { where: { cohortYear: cohortYear } },
      administrator: { where: { endDate: { gte: new Date() } } },
      mentor: { where: { cohortYear: cohortYear } },
      adviser: { where: { cohortYear: cohortYear } },
    },
  });
  return manyUsers;
}

export async function updateUniqueUser(query: Prisma.UserUpdateArgs) {
  try {
    return await prisma.user.update(query);
  } catch (e) {
    if (!(e instanceof PrismaClientKnownRequestError)) {
      throw e;
    }

    throw new SkylabError(e.message, HttpStatusCode.BAD_REQUEST);
  }
}

export async function createOneUser(query: Prisma.UserCreateArgs) {
  try {
    return await prisma.user.create(query);
  } catch (e) {
    if (!(e instanceof PrismaClientKnownRequestError)) {
      throw e;
    }

    if (e.code === "P2002") {
      throw new SkylabError(
        "User is not unique",
        HttpStatusCode.BAD_REQUEST,
        e.meta
      );
    }

    throw new SkylabError(e.message, HttpStatusCode.BAD_REQUEST, e.meta);
  }
}

export async function createManyUsers(queries: Prisma.UserCreateArgs[]) {
  try {
    const createdUsers = await Promise.all(
      queries.map((query) => prisma.user.create(query))
    );
    return createdUsers;
  } catch (e) {
    if (!(e instanceof PrismaClientKnownRequestError)) {
      throw e;
    }

    if (e.code === "P2002") {
      throw new SkylabError(
        "Some users are not unique",
        HttpStatusCode.BAD_REQUEST,
        e.meta
      );
    }

    throw new SkylabError(e.message, HttpStatusCode.BAD_REQUEST, e.meta);
  }
}

export async function deleteUniqueUser(query: Prisma.UserDeleteArgs) {
  try {
    return await prisma.user.delete(query);
  } catch (e) {
    if (!(e instanceof PrismaClientKnownRequestError)) {
      throw e;
    }

    throw new SkylabError(e.message, HttpStatusCode.BAD_REQUEST, e.meta);
  }
}
