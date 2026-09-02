CREATE TABLE "availabilities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "availabilities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"participantId" integer NOT NULL UNIQUE,
	"dates" json DEFAULT '[]' NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "participants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pollId" integer NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "polls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL UNIQUE,
	"adminToken" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"dates" json DEFAULT '[]' NOT NULL,
	"finalizedDate" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_participantId_participants_id_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_pollId_polls_id_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE CASCADE;