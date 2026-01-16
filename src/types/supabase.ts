export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            [key: string]: unknown
        }
        Views: {
            [key: string]: unknown
        }
        Functions: {
            [key: string]: unknown
        }
        Enums: {
            [key: string]: unknown
        }
    }
}
