export function getSupabase() {
  return {
    auth: {
      signOut: async function() { return { error: null }; }
    },
    from: function() {
      return {
        select: function() {
          return {
            eq: function() {
              return {
                single: async function() { return { data: null, error: null }; },
                throwOnError: async function() { return { data: null, error: null }; }
              };
            },
            limit: function() {
              return {
                order: async function() { return { data: [], error: null }; }
              };
            }
          };
        },
        insert: function() {
          return {
            select: async function() { return { data: [], error: null }; }
          };
        },
        update: function() {
          return {
            eq: function() {
              return {
                select: async function() { return { data: [], error: null }; }
              };
            }
          };
        },
        delete: function() {
          return {
            eq: function() {
              return {
                select: async function() { return { data: [], error: null }; }
              };
            }
          };
        }
      };
    },
    storage: {
      from: function() {
        return {
          upload: async function() { return { data: null, error: null }; },
          download: async function() { return null; },
          remove: async function() { return { data: [], error: null }; }
        };
      }
    }
  };
}

export const supabase = getSupabase();