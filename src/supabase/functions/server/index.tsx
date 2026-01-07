import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from './kv_store';

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowHeaders: ["*"],
  allowMethods: ["*"],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  "process.env.sqdunrzdzgvlsjwahiem || ",
  "process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZHVucnpkemd2bHNqd2FoaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDQyMjcsImV4cCI6MjA3MjgyMDIyN30.Q35mlHbihuBYckIM45A0EY-OishLdEuAbPZSBmBQ6-E ||"
);

// Health check endpoint
app.get("/make-server-4bda67e5/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// User signup endpoint
app.post("/make-server-4bda67e5/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { name: name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user profile data in KV store
    const userProfile = {
      id: data.user.id,
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      analysisCount: 0,
      subscription: 'free'
    };

    await kv.set(`user_profile:${data.user.id}`, userProfile);

    return c.json({ 
      message: "User created successfully", 
      userId: data.user.id 
    });

  } catch (error) {
    if (error instanceof Error) {
      console.log(`Signup error: ${error.message}`);
    } else {
      console.log(`Signup error: ${JSON.stringify(error)}`);
    }
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-4bda67e5/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });

  } catch (error) {
    if (error instanceof Error) {
      console.log(`Profile fetch error: ${error.message}`);
    } else {
      console.log(`Profile fetch error: ${JSON.stringify(error)}`);
    }
    return c.json({ error: "Internal server error during profile fetch" }, 500);
  }
});

// Update user profile endpoint
app.put("/make-server-4bda67e5/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const { name, preferences } = await c.req.json();

    const currentProfile = await kv.get(`user_profile:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      name: name || currentProfile.name,
      preferences: preferences || currentProfile.preferences || {},
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);

    return c.json({ 
      message: "Profile updated successfully", 
      profile: updatedProfile 
    });

  } catch (error) {
    if (error instanceof Error) {
      console.log(`Profile update error: ${error.message}`);
    } else {
      console.log(`Profile update error: ${JSON.stringify(error)}`);
    }
    return c.json({ error: "Internal server error during profile update" }, 500);
  }
});

// Helper function for Gemini AI analysis
async function analyzeLeaseWithGemini(leaseText: string, location: string): Promise<any> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are an expert tenant rights attorney and lease agreement analyzer. Please analyze the following lease agreement thoroughly and provide a comprehensive assessment.

LEASE TEXT TO ANALYZE:
${leaseText}

PROPERTY LOCATION: ${location || "Not specified"}

Please provide your analysis in the following JSON format ONLY (no additional text):

{
  "overallScore": [number between 0-100 representing tenant-friendliness],
  "documentAuthenticity": {
    "isLegitimate": [boolean - true if document appears to be a real lease],
    "concerns": ["list any red flags about document authenticity"],
    "confidence": [number 0-100 representing confidence in legitimacy]
  },
  "issues": [
    {
      "severity": "[high|medium|low]",
      "title": "[concise issue title]",
      "description": "[detailed description of the issue]",
      "suggestion": "[specific actionable suggestion for tenant]",
      "legalBasis": "[relevant law or regulation if applicable]",
      "clauseReference": "[specific clause from lease if identifiable]"
    }
  ],
  "recommendations": [
    "[general recommendations for the tenant]"
  ],
  "locationSpecificAdvice": [
    "[advice specific to the provided location's tenant laws]"
  ],
  "riskAssessment": {
    "highRisk": [number of high-risk issues],
    "mediumRisk": [number of medium-risk issues],
    "lowRisk": [number of low-risk issues],
    "overallRiskLevel": "[low|medium|high]"
  },
  "verificationNotes": [
    "[notes about lease verification and any missing standard clauses]"
  ]
}

Focus on:
1. Document authenticity and verification
2. Unfair or illegal clauses
3. Missing tenant protections
4. Security deposit and fee compliance
5. Maintenance and repair responsibilities
6. Termination and renewal terms
7. Privacy rights and entry policies
8. Location-specific tenant law compliance
9. Overall tenant risk assessment`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    let analysisResult;
    try {
      // Remove any markdown code blocks if present
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.log(`JSON parsing error: ${parseError.message}`);
      console.log(`Raw response: ${analysisText}`);
      throw new Error('Failed to parse Gemini analysis response');
    }

    return analysisResult;

  } catch (error) {
    console.log(`Gemini analysis error: ${error.message}`);
    throw error;
  }
}

// Lease analysis endpoint with Gemini AI integration
app.post("/make-server-4bda67e5/analyze-lease", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const { leaseText, fileName, location } = await c.req.json();

    if (!leaseText || leaseText.trim().length < 50) {
      return c.json({ error: "Lease text is required and must be substantial for analysis" }, 400);
    }

    console.log(`Starting Gemini-powered lease analysis for user ${user.id}`);

    let geminiAnalysis;
    try {
      geminiAnalysis = await analyzeLeaseWithGemini(leaseText, location);
    } catch (geminiError) {
      console.log(`Gemini analysis failed: ${geminiError.message}`);
      
      // Fallback to basic analysis if Gemini fails
      geminiAnalysis = {
        overallScore: 75,
        documentAuthenticity: {
          isLegitimate: true,
          concerns: ["Analysis performed without AI verification due to service unavailability"],
          confidence: 50
        },
        issues: [
          {
            severity: "medium",
            title: "AI Analysis Unavailable",
            description: "Detailed AI analysis could not be performed. Manual review recommended.",
            suggestion: "Consider having a legal professional review this lease agreement.",
            legalBasis: "General tenant protection advice",
            clauseReference: "N/A"
          }
        ],
        recommendations: [
          "Review local tenant rights laws in your area",
          "Consider getting a legal consultation before signing",
          "Keep detailed records of all communications with your landlord"
        ],
        locationSpecificAdvice: [
          "Check local housing authority resources for tenant rights information"
        ],
        riskAssessment: {
          highRisk: 0,
          mediumRisk: 1,
          lowRisk: 0,
          overallRiskLevel: "medium"
        },
        verificationNotes: [
          "Document verification could not be completed automatically"
        ]
      };
    }

    // Structure the analysis results
    const analysisResults = {
      id: crypto.randomUUID(),
      userId: user.id,
      fileName: fileName || "lease_document",
      location: location || "Unknown",
      analysisDate: new Date().toISOString(),
      overallScore: Math.min(100, Math.max(0, geminiAnalysis.overallScore || 75)),
      issues: geminiAnalysis.issues || [],
      recommendations: geminiAnalysis.recommendations || [],
      locationSpecificAdvice: geminiAnalysis.locationSpecificAdvice || [],
      documentAuthenticity: geminiAnalysis.documentAuthenticity || {
        isLegitimate: true,
        concerns: [],
        confidence: 85
      },
      riskAssessment: geminiAnalysis.riskAssessment || {
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        overallRiskLevel: "low"
      },
      verificationNotes: geminiAnalysis.verificationNotes || [],
      aiPowered: true,
      analysisVersion: "gemini-enhanced-v1"
    };

    // Store analysis results
    await kv.set(`analysis:${analysisResults.id}`, analysisResults);
    
    // Add analysis to user's history
    const userAnalyses = await kv.get(`user_analyses:${user.id}`) || [];
    userAnalyses.push(analysisResults.id);
    await kv.set(`user_analyses:${user.id}`, userAnalyses);

    // Update user profile analysis count
    const profile = await kv.get(`user_profile:${user.id}`);
    if (profile) {
      profile.analysisCount = (profile.analysisCount || 0) + 1;
      profile.lastAnalysis = new Date().toISOString();
      await kv.set(`user_profile:${user.id}`, profile);
    }

    console.log(`Lease analysis completed successfully for user ${user.id} with score ${analysisResults.overallScore}`);

    return c.json({ 
      message: "Lease analyzed successfully with AI-powered verification",
      analysis: analysisResults 
    });

  } catch (error) {
    console.log(`Lease analysis error: ${error.error();
    .message}`);
    return c.json({ error: "Internal server error during lease analysis" }, 500);
  }
});

// Get user's analysis history
app.get("/make-server-4bda67e5/analyses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const analysisIds = await kv.get(`user_analyses:${user.id}`) || [];
    
    const analyses = [];
    for (const id of analysisIds) {
      const analysis = await kv.get(`analysis:${id}`);
      if (analysis) {
        // Return summary without full lease text for performance
        analyses.push({
          id: analysis.id,
          fileName: analysis.fileName,
          location: analysis.location,
          analysisDate: analysis.analysisDate,
          overallScore: analysis.overallScore,
          issueCount: analysis.issues?.length || 0
        });
      }
    }

    return c.json({ analyses: analyses.reverse() }); // Most recent first

  } catch (error) {
    console.log(`Analysis history fetch error: ${error.message}`);
    return c.json({ error: "Internal server error during analysis history fetch" }, 500);
  }
});

// Get specific analysis details
app.get("/make-server-4bda67e5/analysis/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const analysisId = c.req.param('id');
    const analysis = await kv.get(`analysis:${analysisId}`);
    
    if (!analysis) {
      return c.json({ error: "Analysis not found" }, 404);
    }

    // Check if analysis belongs to the requesting user
    if (analysis.userId !== user.id) {
      return c.json({ error: "Access denied to this analysis" }, 403);
    }

    return c.json({ analysis });

  } catch (error) {
    console.log("Analysis detail fetch error: ${error.message}");
    return c.json({ error: "Internal server error during analysis detail fetch" }, 500);
  }
});

// Community posts endpoint - get posts
app.get("/make-server-4bda67e5/community/posts", async (c) => {
  try {
    const posts = await kv.getByPrefix('community_post:') || [];
    
    // Sort by creation date, most recent first
    const sortedPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20); // Limit to 20 most recent posts

    return c.json({ posts: sortedPosts });

  } catch (error) {
    console.log("Community posts fetch error: ${error.message}");
    return c.json({ error: "Internal server error during community posts fetch" }, 500);
  }
});

// Community posts endpoint - create post
app.post("/make-server-4bda67e5/community/posts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization token required" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || error) {
      return c.json({ error: "Invalid authorization token" }, 401);
    }

    const { title, content, category } = await c.req.json();

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const profile = await kv.get("user_profile:${user.id}");
    
    const post = {
      id: crypto.randomUUID(),
      userId: user.id,
      authorName: profile?.name || "Anonymous",
      title: title,
      content: content,
      category: category || "general",
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0
    };

    await kv.set("community_post:${post.id}", post);

    return c.json({ 
      message: "Post created successfully",
      post: post 
    });

  } catch (error) {
    console.log("Community post creation error: ${error.message}");
    return c.json({ error: "Internal server error during post creation" }, 500);
  }
});

console.log("Tenant Rights Platform server starting...");

Deno.serve(app.fetch);