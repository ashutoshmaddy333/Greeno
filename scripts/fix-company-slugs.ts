import dbConnect from "@/lib/db"
import Company from "@/models/Company"

async function fixCompanySlugs() {
  try {
    await dbConnect()
    console.log('Connected to database')

    // Find all companies
    const companies = await Company.find({}).lean()
    console.log(`Found ${companies.length} companies`)

    // Update companies missing slugs
    for (const company of companies) {
      if (!company.slug) {
        const slug = company.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        console.log('Updating company:', {
          id: company._id.toString(),
          name: company.name,
          slug
        })

        await Company.findByIdAndUpdate(company._id, { slug })
      }
    }

    console.log('Finished updating company slugs')
    process.exit(0)
  } catch (error) {
    console.error('Error fixing company slugs:', error)
    process.exit(1)
  }
}

fixCompanySlugs() 