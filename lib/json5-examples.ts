export const json5Example = `{
  // This is a JSON5 example
  title: "JSON5 Example Schema",
  description: "A schema that demonstrates JSON5 features",
  
  // You can use unquoted property names
  type: "object",
  
  // You can use single quotes for strings
  $schema: 'http://json-schema.org/draft-07/schema#',
  
  // You can use trailing commas in objects and arrays
  properties: {
    name: {
      type: "string",
      description: "The name of the thing",
    },
    
    /* You can use multi-line
       comments like this */
    options: {
      type: "array",
      items: {
        oneOf: [
          { type: "string" },
          { type: "number" },
        ]
      },
    },
    
    // Numbers can have trailing decimal points
    version: {
      type: "number",
      default: 1.,
    },
    
    // You can use hexadecimal numbers
    color: {
      type: "string",
      default: "#0xC0FFEE",
    },

    // You can use NaN and Infinity
    limits: {
      type: "object",
      properties: {
        min: { type: "number", default: -Infinity },
        max: { type: "number", default: +Infinity },
        special: { type: "number", default: NaN },
      },
    },
  },
  
  required: [
    "name",
    "options",
  ],
}`

// Add this renovate config example
export const renovateConfigExample = `{
  // Renovate configuration
  extends: [
    "config:base",
    ":timezone(Asia/Tokyo)",
    ":enableVulnerabilityAlertsWithLabel(security)",
  ],
  hostRules: [
    {
      hostType: 'maven',
      matchHost: 'https://maven.pkg.github.com/bm-sms/xuan/',
    },
  ],
  schedule: ["after 6am and before 9am on monday"],
  prHourlyLimit: 20,
  prConcurrentLimit: 100,
  semanticCommits: "enabled",
}`

