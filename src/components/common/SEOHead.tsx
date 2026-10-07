import React, { useEffect } from 'react'

const BASE_URL = (import.meta.env.VITE_SITE_URL || 'https://icstconnect.com').replace(/\/$/, '')
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`

export interface BreadcrumbItem {
  name: string
  path: string
}

export interface SEOHeadProps {
  title: string
  description?: string
  canonicalPath?: string
  canonical?: string
  noindex?: boolean
  schema?: Record<string, any> | Record<string, any>[]
  ogType?: string
  ogImage?: string
  breadcrumbs?: BreadcrumbItem[]
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath = '',
  canonical,
  noindex = false,
  schema,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  breadcrumbs
}) => {
  const activeCanonicalPath = canonical || canonicalPath || ''

  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('ICST') ? title : `${title} | ICST Chowberia`
    document.title = formattedTitle

    // Helper to get or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attributeName, attributeValue)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    // 2. Robots Directive
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    // 3. Meta Description (Target 120-160 chars)
    if (description) {
      setMetaTag('name', 'description', description)
    }

    // 4. Canonical URL
    const cleanPath = activeCanonicalPath.startsWith('/') ? activeCanonicalPath : `/${activeCanonicalPath}`
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.href = canonicalUrl

    // 5. OpenGraph Tags
    setMetaTag('property', 'og:title', formattedTitle)
    if (description) setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', canonicalUrl)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:image', ogImage)
    setMetaTag('property', 'og:site_name', 'ICST Connect')

    // 6. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', formattedTitle)
    if (description) setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', ogImage)

    // 7. Inject JSON-LD Schema
    const scriptId = 'dynamic-seo-schema'
    const existingScript = document.getElementById(scriptId)
    if (existingScript) existingScript.remove()

    const schemasToInject: any[] = []

    if (schema) {
      if (Array.isArray(schema)) {
        schemasToInject.push(...schema)
      } else {
        schemasToInject.push(schema)
      }
    }

    // Add BreadcrumbList Schema if breadcrumbs provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemasToInject.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: `${BASE_URL}${crumb.path.startsWith('/') ? crumb.path : `/${crumb.path}`}`
        }))
      })
    }

    if (schemasToInject.length > 0) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      script.text = JSON.stringify(schemasToInject.length === 1 ? schemasToInject[0] : schemasToInject)
      document.head.appendChild(script)
    }

    return () => {
      const cleanupScript = document.getElementById(scriptId)
      if (cleanupScript) cleanupScript.remove()
    }
  }, [title, description, canonicalPath, noindex, schema, ogType, ogImage, breadcrumbs])

  return null
}

export default SEOHead
