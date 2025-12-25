
import { z } from "zod";

// TODO: add proper role values as an enum like:
// "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
// "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
// "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator"

const ContextSchema = z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    type: z.array(z.string()),
});

const LaunchInfoSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
    context: ContextSchema,
});


type LaunchInfoData = z.infer<typeof LaunchInfoSchema>;

class LaunchInfo {
    name: string;
    email: string;
    roles: string[];
    context:  z.infer<typeof ContextSchema>;

    constructor(props: LaunchInfoData) {
        const parsed = LaunchInfoSchema.parse(props);
        this.name = parsed.name;
        this.email = parsed.email;
        this.roles = parsed.roles;
        this.context = parsed.context;
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
            roles: this.roles,
            context: this.context,
        };
    }
}

export { LaunchInfo };
