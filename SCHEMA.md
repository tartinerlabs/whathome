# Database Schema

Schema files: `src/db/schema/{projects,transactions,developers,market-data,users,videos,research,auth}.ts`

## Core Tables

### `developers`
id, name, slug (unique), description, website, logoUrl, timestamps

### `projects`
id, name, slug (unique), developerId (FK), districtNumber (1-28), region (CCR/RCR/OCR), address, postalCode, tenure (freehold/99-year/999-year/103-year), tenureYears, tenureStartDate, totalUnits, unitsSold, launchDate, topDate, completionDate, status (upcoming/launched/selling/sold_out/completed), latitude, longitude, siteArea, plotRatio, description, aiSummary, lastResearchedAt, dataSourceHash, timestamps

### `project_units`
id, projectId (FK cascade), unitType (1BR/2BR/3BR/4BR/5BR/Penthouse), sizeSqftMin, sizeSqftMax, pricePsf, priceFrom, priceTo, totalCount, soldCount, floorPlanUrl, timestamps

### `transactions`
id, projectId (nullable FK), projectName, address, unitNumber, floorRange, areaSqm, areaSqft, transactedPrice, pricePsf, contractDate, saleType (new_sale/sub_sale/resale), propertyType (condo/apt/ec/strata_landed), district, tenure, sourceDataset, sourceRecordId (unique), timestamps

### `nearby_amenities`
id, projectId (FK cascade), amenityType (mrt/bus_interchange/school/mall/park/hospital), name, distanceMeters, walkMinutes, latitude, longitude

### `project_images`
id, projectId (FK cascade), imageType (site_plan/floor_plan/render/photo/location_map), url, altText, unitType (nullable), sortOrder, timestamps

### `price_indices`
id, quarter (e.g. 2026Q1), region (CCR/RCR/OCR/Overall), indexValue, percentageChange, sourceDataset, timestamps. Unique on (quarter, region).

## User Tables

### `users`
Better Auth managed: id, name, email, image, role

### `saved_projects`
id, userId (FK), projectId (FK), createdAt

### `saved_searches`
id, userId (FK), name, filters (jsonb), createdAt

## System Tables

### `video_sources`
id, projectId (nullable FK), channelName, videoId, title, publishedAt, transcriptText, extractedData (jsonb), processedAt, timestamps

### `research_runs`
id, agentType (data_ingestion/project_research/analysis/backfill/youtube_research), status (pending/running/completed/failed), projectId (nullable FK), inputPayload (jsonb), outputSummary, tokensUsed, costUsd, startedAt, completedAt, errorMessage, timestamps
