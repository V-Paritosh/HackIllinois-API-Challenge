const errorResponse = (description: string, example: { error: string; message: string }) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      example,
    },
  },
});

const idParameter = (name: string, description: string, example: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
  example,
});

const paginationParameters = [
  {
    name: "page",
    in: "query",
    description: "1-based page number.",
    required: false,
    schema: { type: "integer", minimum: 1, default: 1 },
    example: 1,
  },
  {
    name: "limit",
    in: "query",
    description: "Maximum number of records to return. Must be 100 or less.",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    example: 20,
  },
];

const shiftExample = {
  id: "68c0d4a3e7c2a1b9f0d67890",
  title: "Morning Check-in",
  description: "Welcome volunteers.",
  location: "Siebel Center",
  startTime: "2099-01-01T09:00:00.000Z",
  endTime: "2099-01-01T11:00:00.000Z",
  capacity: 4,
  signupCount: 1,
  remainingSpots: 3,
  status: "available",
  date: "2099-01-01",
  startTimeLocal: "09:00",
  endTimeLocal: "11:00",
};

const volunteerExample = {
  id: "68c0d4a3e7c2a1b9f0d12345",
  name: "Grace Hopper",
  email: "grace@example.com",
  phone: "2175550100",
};

const volunteerInput = {
  type: "object",
  required: ["name", "email"],
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      description: "Volunteer’s full name.",
      example: "Grace Hopper",
    },
    email: {
      type: "string",
      format: "email",
      description: "Email address. It is normalized to lowercase.",
      example: "grace@example.com",
    },
    phone: {
      type: "string",
      description:
        "Optional 10-digit phone number. Punctuation is accepted and removed when stored.",
      example: "217-555-0100",
    },
  },
  example: { name: "Grace Hopper", email: "grace@example.com", phone: "217-555-0100" },
};

const shiftInput = {
  type: "object",
  required: ["title", "startTime", "endTime", "capacity"],
  properties: {
    title: {
      type: "string",
      minLength: 1,
      maxLength: 150,
      description: "Display name for the shift.",
      example: "Morning Check-in",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "Optional details for volunteers.",
      example: "Welcome volunteers and distribute badges.",
    },
    location: {
      type: "string",
      maxLength: 200,
      description: "Optional location where the shift takes place.",
      example: "Siebel Center",
    },
    startTime: {
      type: "string",
      format: "date-time",
      description: "Shift start time in ISO 8601 format.",
      example: "2099-01-01T09:00:00.000Z",
    },
    endTime: {
      type: "string",
      format: "date-time",
      description: "Shift end time in ISO 8601 format; must be after startTime.",
      example: "2099-01-01T11:00:00.000Z",
    },
    capacity: {
      type: "integer",
      minimum: 1,
      description: "Maximum number of volunteers who can sign up.",
      example: 4,
    },
  },
  example: {
    title: "Morning Check-in",
    description: "Welcome volunteers and distribute badges.",
    location: "Siebel Center",
    startTime: "2099-01-01T09:00:00.000Z",
    endTime: "2099-01-01T11:00:00.000Z",
    capacity: 4,
  },
};

const shiftResponse = {
  allOf: [
    { $ref: "#/components/schemas/ShiftInput" },
    {
      type: "object",
      required: [
        "id",
        "signupCount",
        "remainingSpots",
        "status",
        "date",
        "startTimeLocal",
        "endTimeLocal",
      ],
      properties: {
        id: { type: "string", description: "Unique shift identifier.", example: shiftExample.id },
        description: { type: "string", description: "Empty string when omitted at creation." },
        location: { type: "string", description: "Empty string when omitted at creation." },
        signupCount: {
          type: "integer",
          minimum: 0,
          description: "Current signup count.",
          example: 1,
        },
        remainingSpots: {
          type: "integer",
          minimum: 0,
          description: "Capacity remaining after current signups.",
          example: 3,
        },
        status: {
          type: "string",
          enum: ["available", "nearly_full", "full"],
          description: "Availability derived from signupCount and capacity.",
          example: "available",
        },
        date: {
          type: "string",
          format: "date",
          description: "Calendar date derived from startTime.",
          example: "2099-01-01",
        },
        startTimeLocal: {
          type: "string",
          description: "UTC time portion in HH:mm format.",
          example: "09:00",
        },
        endTimeLocal: {
          type: "string",
          description: "UTC time portion in HH:mm format.",
          example: "11:00",
        },
      },
    },
  ],
};

const commonErrors = {
  "400": errorResponse(
    "The request is invalid, failed validation, or contains a malformed identifier.",
    {
      error: "ValidationError",
      message: "title: Required",
    },
  ),
  "500": errorResponse("An unexpected server error occurred.", {
    error: "InternalServerError",
    message: "Something went wrong.",
  }),
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "HackIllinois Volunteer API",
    version: "1.0.0",
    description:
      "A REST API for managing HackIllinois volunteer shifts and self-service volunteer signups.",
  },
  servers: [{ url: "/api", description: "Current API server" }],
  tags: [
    { name: "Health", description: "Service availability checks." },
    { name: "Shifts", description: "Create and manage volunteer shifts." },
    { name: "Signups", description: "Register volunteers for shifts and browse assignments." },
    { name: "Volunteers", description: "Create and manage volunteer profiles." },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error", "message"],
        properties: {
          error: {
            type: "string",
            description: "Stable application error code.",
            example: "ShiftNotFound",
          },
          message: {
            type: "string",
            description: "Human-readable explanation.",
            example: "Shift not found.",
          },
        },
      },
      HealthResponse: {
        type: "object",
        required: ["ok"],
        properties: { ok: { type: "boolean", example: true } },
        example: { ok: true },
      },
      VolunteerInput: volunteerInput,
      Volunteer: {
        allOf: [
          { $ref: "#/components/schemas/VolunteerInput" },
          {
            type: "object",
            required: ["id", "name", "email"],
            properties: {
              id: {
                type: "string",
                description: "Unique volunteer identifier.",
                example: volunteerExample.id,
              },
            },
          },
        ],
        example: volunteerExample,
      },
      VolunteerWithSignupCount: {
        allOf: [
          { $ref: "#/components/schemas/Volunteer" },
          {
            type: "object",
            required: ["signupCount"],
            properties: {
              signupCount: {
                type: "integer",
                minimum: 0,
                description: "Number of assigned shifts.",
                example: 2,
              },
            },
          },
        ],
      },
      ShiftInput: shiftInput,
      Shift: shiftResponse,
      Signup: {
        type: "object",
        required: ["id", "createdAt"],
        properties: {
          id: {
            type: "string",
            description: "Unique signup identifier.",
            example: "68c0d4a3e7c2a1b9f0d24680",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Signup creation time.",
            example: "2099-01-01T08:30:00.000Z",
          },
        },
      },
      SignupResponse: {
        type: "object",
        required: ["signup", "volunteer", "shift", "remainingSpots"],
        properties: {
          signup: { $ref: "#/components/schemas/Signup" },
          volunteer: { $ref: "#/components/schemas/Volunteer" },
          shift: { $ref: "#/components/schemas/Shift" },
          remainingSpots: { type: "integer", minimum: 0, example: 3 },
        },
      },
      DeleteResponse: {
        type: "object",
        required: ["ok"],
        properties: { ok: { type: "boolean", example: true } },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        description: "Returns a lightweight availability response without querying the database.",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "The API process is available.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
                example: { ok: true },
              },
            },
          },
        },
      },
    },
    "/shifts": {
      get: {
        tags: ["Shifts"],
        summary: "List shifts",
        description:
          "Returns shifts sorted by start time with optional pagination, upcoming filtering, and title search.",
        operationId: "listShifts",
        parameters: [
          ...paginationParameters,
          {
            name: "upcoming",
            in: "query",
            description: "When true, return only shifts starting now or later.",
            schema: { type: "boolean" },
            example: true,
          },
          {
            name: "title",
            in: "query",
            description: "Case-insensitive title search.",
            schema: { type: "string" },
            example: "check-in",
          },
        ],
        responses: {
          "200": {
            description: "A page of shifts.",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Shift" } },
                example: [shiftExample],
              },
            },
          },
          ...commonErrors,
        },
      },
      post: {
        tags: ["Shifts"],
        summary: "Create a shift",
        description: "Creates a new volunteer shift and returns its computed availability fields.",
        operationId: "createShift",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ShiftInput" },
              example: shiftInput.example,
            },
          },
        },
        responses: {
          "201": {
            description: "The shift was created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Shift" },
                example: shiftExample,
              },
            },
          },
          ...commonErrors,
        },
      },
    },
    "/shifts/{shiftId}": {
      parameters: [idParameter("shiftId", "Unique identifier of the shift.", shiftExample.id)],
      get: {
        tags: ["Shifts"],
        summary: "Get a shift",
        description: "Returns one shift with its current signup count and availability.",
        operationId: "getShift",
        responses: {
          "200": {
            description: "The requested shift.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Shift" },
                example: shiftExample,
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested shift does not exist.", {
            error: "ShiftNotFound",
            message: "Shift not found.",
          }),
        },
      },
      patch: {
        tags: ["Shifts"],
        summary: "Update a shift",
        description:
          "Updates one or more shift fields. Omitted fields retain their current values.",
        operationId: "updateShift",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: shiftInput.properties },
              example: { capacity: 6, location: "Main Hall" },
            },
          },
        },
        responses: {
          "200": {
            description: "The shift was updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Shift" },
                example: shiftExample,
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested shift does not exist.", {
            error: "ShiftNotFound",
            message: "Shift not found.",
          }),
          "409": errorResponse("The new capacity cannot be lower than the current signup count.", {
            error: "InvalidCapacity",
            message: "Capacity cannot be below the current signup count.",
          }),
        },
      },
      delete: {
        tags: ["Shifts"],
        summary: "Delete a shift",
        description: "Deletes a shift and its associated signup records.",
        operationId: "deleteShift",
        responses: {
          "200": {
            description: "The shift was deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
                example: { ok: true },
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested shift does not exist.", {
            error: "ShiftNotFound",
            message: "Shift not found.",
          }),
        },
      },
    },
    "/shifts/{shiftId}/signup": {
      post: {
        tags: ["Signups"],
        summary: "Sign up for a shift",
        description:
          "Creates or reuses a volunteer profile and signs that volunteer up for the selected shift. Email identifies an existing volunteer.",
        operationId: "createSignup",
        parameters: [
          idParameter("shiftId", "Unique identifier of the shift to join.", shiftExample.id),
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VolunteerInput" },
              example: volunteerInput.example,
            },
          },
        },
        responses: {
          "201": {
            description: "The volunteer was successfully signed up.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/SignupResponse" } },
            },
          },
          ...commonErrors,
          "404": errorResponse("The selected shift does not exist.", {
            error: "ShiftNotFound",
            message: "Shift not found.",
          }),
          "409": errorResponse(
            "The signup conflicts with the current shift state, because the volunteer is already signed up or the shift is full.",
            { error: "DuplicateSignup", message: "You are already signed up for this shift." },
          ),
        },
      },
    },
    "/shifts/{shiftId}/signup/{volunteerId}": {
      delete: {
        tags: ["Signups"],
        summary: "Cancel a signup",
        description:
          "Removes a volunteer’s signup from a shift. An orphaned volunteer profile is removed automatically.",
        operationId: "deleteSignup",
        parameters: [
          idParameter("shiftId", "Unique identifier of the shift.", shiftExample.id),
          idParameter("volunteerId", "Unique identifier of the volunteer.", volunteerExample.id),
        ],
        responses: {
          "200": {
            description: "The signup was removed.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
                example: { ok: true },
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The signup does not exist.", {
            error: "SignupNotFound",
            message: "Signup not found.",
          }),
        },
      },
    },
    "/shifts/{shiftId}/volunteers": {
      get: {
        tags: ["Signups"],
        summary: "List volunteers on a shift",
        description: "Returns the volunteer profiles currently signed up for a shift.",
        operationId: "listShiftVolunteers",
        parameters: [idParameter("shiftId", "Unique identifier of the shift.", shiftExample.id)],
        responses: {
          "200": {
            description: "Volunteers signed up for the shift.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Volunteer" },
                  example: [volunteerExample],
                },
              },
            },
          },
          ...commonErrors,
        },
      },
    },
    "/volunteers": {
      get: {
        tags: ["Volunteers"],
        summary: "List volunteers",
        description:
          "Returns volunteers sorted by creation time, newest first, with each volunteer’s signup count. The shared query validator also accepts upcoming and title, but those filters are not applied to volunteer results.",
        operationId: "listVolunteers",
        parameters: [
          ...paginationParameters,
          {
            name: "upcoming",
            in: "query",
            description:
              "Accepted by the shared query validator but not used for volunteer filtering.",
            schema: { type: "boolean" },
            example: true,
          },
          {
            name: "title",
            in: "query",
            description:
              "Accepted by the shared query validator but not used for volunteer filtering.",
            schema: { type: "string" },
            example: "check-in",
          },
        ],
        responses: {
          "200": {
            description: "A page of volunteers.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/VolunteerWithSignupCount" },
                },
                example: [{ ...volunteerExample, signupCount: 2 }],
              },
            },
          },
          ...commonErrors,
        },
      },
      post: {
        tags: ["Volunteers"],
        summary: "Create a volunteer",
        description: "Creates a volunteer profile. Email addresses are normalized to lowercase.",
        operationId: "createVolunteer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VolunteerInput" },
              example: { name: "Ada Lovelace", email: "ada@example.com", phone: "217-555-0123" },
            },
          },
        },
        responses: {
          "201": {
            description: "The volunteer was created.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Volunteer" },
                example: volunteerExample,
              },
            },
          },
          ...commonErrors,
          "409": errorResponse("A volunteer with the email already exists.", {
            error: "Conflict",
            message: "A record with those details already exists.",
          }),
        },
      },
    },
    "/volunteers/{volunteerId}": {
      parameters: [
        idParameter("volunteerId", "Unique identifier of the volunteer.", volunteerExample.id),
      ],
      get: {
        tags: ["Volunteers"],
        summary: "Get a volunteer",
        description: "Returns one volunteer profile by identifier.",
        operationId: "getVolunteer",
        responses: {
          "200": {
            description: "The requested volunteer.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Volunteer" },
                example: volunteerExample,
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested volunteer does not exist.", {
            error: "VolunteerNotFound",
            message: "Volunteer not found.",
          }),
        },
      },
      patch: {
        tags: ["Volunteers"],
        summary: "Update a volunteer",
        description:
          "Updates one or more volunteer fields. Omitted fields retain their current values.",
        operationId: "updateVolunteer",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: volunteerInput.properties },
              example: { name: "Ada Byron", phone: "217-555-0199" },
            },
          },
        },
        responses: {
          "200": {
            description: "The volunteer was updated.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Volunteer" },
                example: volunteerExample,
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested volunteer does not exist.", {
            error: "VolunteerNotFound",
            message: "Volunteer not found.",
          }),
          "409": errorResponse("A volunteer with the email already exists.", {
            error: "Conflict",
            message: "A record with those details already exists.",
          }),
        },
      },
      delete: {
        tags: ["Volunteers"],
        summary: "Delete a volunteer",
        description: "Deletes a volunteer and all of that volunteer’s signup records.",
        operationId: "deleteVolunteer",
        responses: {
          "200": {
            description: "The volunteer was deleted.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
                example: { ok: true },
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("The requested volunteer does not exist.", {
            error: "VolunteerNotFound",
            message: "Volunteer not found.",
          }),
        },
      },
    },
    "/volunteers/by-email/{email}/shifts": {
      get: {
        tags: ["Signups"],
        summary: "Find a volunteer’s shifts by email",
        description:
          "Looks up a volunteer by email address and returns that volunteer with all assigned shifts. Matching is case-insensitive.",
        operationId: "listVolunteerShiftsByEmail",
        parameters: [
          {
            name: "email",
            in: "path",
            required: true,
            description:
              "Email address. URL-encode the value when it contains reserved characters.",
            schema: { type: "string", format: "email" },
            example: "grace%40example.com",
          },
        ],
        responses: {
          "200": {
            description: "The volunteer and assigned shifts.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["volunteer", "shifts"],
                  properties: {
                    volunteer: { $ref: "#/components/schemas/Volunteer" },
                    shifts: { type: "array", items: { $ref: "#/components/schemas/Shift" } },
                  },
                  example: { volunteer: volunteerExample, shifts: [shiftExample] },
                },
              },
            },
          },
          ...commonErrors,
          "404": errorResponse("No volunteer was found for that email.", {
            error: "VolunteerNotFound",
            message: "No volunteer was found for that email.",
          }),
        },
      },
    },
    "/volunteers/{volunteerId}/shifts": {
      get: {
        tags: ["Signups"],
        summary: "List a volunteer’s shifts",
        description: "Returns all shifts assigned to a volunteer by volunteer identifier.",
        operationId: "listVolunteerShifts",
        parameters: [
          idParameter("volunteerId", "Unique identifier of the volunteer.", volunteerExample.id),
        ],
        responses: {
          "200": {
            description: "The volunteer’s assigned shifts.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Shift" },
                  example: [shiftExample],
                },
              },
            },
          },
          ...commonErrors,
        },
      },
    },
  },
};
