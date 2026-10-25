import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BookOpen, Bookmark, BookmarkCheck,
  Brain, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp,
  Clipboard, Code2, Copy, ExternalLink, GraduationCap,
  Layers3, Moon, Play, RotateCcw, Search,
  SlidersHorizontal, Sparkles, Sun, TerminalSquare, Trophy,
} from 'lucide-react';
// Embedded reference data below — standalone single-file version.
// T.O Analytics — curated, offline-first Splunk learning catalogue.
// Examples are teaching templates: replace indexes, sourcetypes and fields with your own.
// Language labels matter: SPL2-only features are not universal in every Splunk interface.

export const DOCS = {
  spl: 'https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.6/quick-reference/command-quick-reference',
  spl2: 'https://help.splunk.com/en/splunk-cloud-platform/search/spl2-search-reference/quick-reference-for-spl2-commands/quick-reference-for-spl2-commands',
  comparison: 'https://help.splunk.com/en/splunk-enterprise/search/spl2-overview/specific-differences-between-spl-and-spl2',
  security: 'https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/detections/create-finding-based-detections-in-splunk-enterprise-security',
};

const entries = [];
const c = (name, category, level, definition, example, expected, tip, language = 'SPL', kind = 'Command', steps = []) => {
  entries.push({ id: `${kind}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, category, level, definition, example, expected, tip, language, kind, steps });
};

// CORE SEARCHING, FILTERING AND PRESENTATION
c('search','Search & Filtering','Beginner','Find events using an index, keyword and field-value constraints.','index=web sourcetype=access_combined status=500 earliest=-24h','Only matching 500-status web events from the last 24 hours.','Start with a narrow index and time range. Fields are illustrative.');
c('where','Search & Filtering','Intermediate','Filter events with eval expressions and functions.','index=web | where status>=500 AND like(uri,"/api%")','Only server errors for API paths.','Use where for expression logic; push simple indexed constraints into the initial search.');
c('fields','Search & Filtering','Beginner','Keep or discard fields to simplify output.','index=web | fields _time host status uri','Only the selected columns remain in each event.','Remove unneeded fields early to reduce later processing.');
c('table','Search & Filtering','Beginner','Display chosen fields in a specified column order.','index=web | table _time user action status','Results are displayed as a clean table.','Use near the end; table can make later commands lose fields.');
c('rename','Search & Filtering','Beginner','Give result fields readable names.','index=web | stats count BY status | rename count AS Requests','The count column is labeled Requests.','Renaming a field can break commands that expect the original name.');
c('dedup','Search & Filtering','Intermediate','Keep selected unique combinations of field values.','index=auth | sort 0 -_time | dedup user | table user _time src_ip','The most recent event per user, based on sorted time.','For reliable latest-event selection, sort first; use stats for large-scale grouped summaries.');
c('sort','Search & Filtering','Beginner','Order results by one or more fields.','index=web | stats count BY uri | sort - count','Endpoints sorted by descending event count.','sort has a default result limit; use sort 0 when you truly need all results.');
c('head','Search & Filtering','Beginner','Keep the first N records of the current pipeline.','index=web | sort - _time | head 20','The first twenty events after sorting.','A high time range plus expensive sort can still be slow.');
c('tail','Search & Filtering','Intermediate','Keep the last N records of the incoming result set.','index=web | tail 10','The last ten events in pipeline order.','Result order matters; do not assume tail automatically finds the oldest timestamps.');
c('regex','Search & Filtering','Intermediate','Filter events based on a regular expression against a field.','index=web | regex uri="^/api/(orders|payments)"','Only matching API endpoint paths.','regex filters; rex extracts fields.');
c('replace','Search & Filtering','Intermediate','Replace matching values in a field.','index=web | replace 200 WITH success IN status','Status value 200 is shown as success.','This is value replacement, not a general regex extraction tool.');
c('fillnull','Search & Filtering','Intermediate','Substitute a value for null fields in search results.','index=web | fillnull value="unknown" user','Missing user values shown as unknown where the field exists in the result schema.','Fields that are null in every event may need explicit creation first.');
c('fieldsummary','Search & Filtering','Intermediate','Summarize field frequency, types and example values.','index=web | fieldsummary','A field profiling table useful for initial data exploration.','Start with a bounded time range to limit the scan.');
c('addinfo','Search & Filtering','Intermediate','Append search timing metadata to results.','index=web | head 1 | addinfo | table info_min_time info_max_time','Displays the search window boundaries.','Useful for troubleshooting searches with dynamic time pickers.');
c('eventcount','Search & Filtering','Advanced','Return counts of events in indexes or index-like datasets.','| eventcount summarize=false index=*','Counts by index with no full event search.','Counts and exact behavior depend on permissions and command options.');
c('metadata','Search & Filtering','Advanced','Summarize indexed host, source or sourcetype metadata.','| metadata type=hosts index=web','Host metadata including recent observation times.','Metadata timestamps are not guaranteed evidence of source freshness in every architecture.');

// STATS AND TIME SERIES
c('stats','Statistics & Time','Beginner','Aggregate events into grouped summary rows.','index=web | stats count AS requests avg(response_ms) AS avg_ms BY status','One row per status with request count and average duration.','stats transforms rows; original event-level fields are no longer present unless grouped or aggregated.','SPL','Command',['index=web reads example data.','stats count totals events and avg calculates response time.','BY status creates one summary row for each status.']);
c('eventstats','Statistics & Time','Intermediate','Calculate aggregates but preserve individual events.','index=web | eventstats avg(response_ms) AS global_avg | table response_ms global_avg','Each event keeps its duration plus the average across the input.','Use when event-level investigation needs global or group context.');
c('streamstats','Statistics & Time','Advanced','Calculate running or windowed aggregates in stream order.','index=auth | sort 0 user _time | streamstats current=f last(action) AS previous_action BY user','Each user event has the previous action from its sorted history.','Streaming order is essential; current=f excludes the current row.','SPL','Command',['Sort by user and ascending _time.','streamstats keeps the previous action by user.','Compare previous_action with current action for sequences.']);
c('timechart','Statistics & Time','Beginner','Aggregate events into time buckets for trend charts.','index=web | timechart span=5m count AS requests BY status','A five-minute trend with a series for each HTTP status.','Set span explicitly when comparing consistent monitoring intervals.');
c('chart','Statistics & Time','Intermediate','Produce a pivoted statistical chart across one or two fields.','index=web | chart count OVER host BY status','A host-by-status cross-tabulation.','High-cardinality BY values can create unwieldy results.');
c('bin','Statistics & Time','Intermediate','Put numbers or timestamps into discrete buckets.','index=web | bin _time span=15m | stats count BY _time host','Counts for each host in 15-minute buckets.','SPL stats does not have the same span syntax as SPL2 stats.');
c('bucket','Statistics & Time','Intermediate','Alias for bin, for bucketing numeric or time fields.','index=web | bucket _time span=1h | stats count BY _time','Hourly event totals.','bin and bucket are equivalent SPL commands.');
c('timewrap','Statistics & Time','Advanced','Overlay equivalent time periods to compare trends.','index=web | timechart span=1d count | timewrap 1week','Daily counts across weekly comparison series.','Make sure you have enough historical data for the chosen comparison.');
c('trendline','Statistics & Time','Advanced','Calculate moving average or other trendline statistics.','index=web | timechart span=1h count AS requests | trendline sma5(requests) AS smooth','Raw hourly counts and a 5-point simple moving average.','Smoothing highlights trends but can hide short spikes.');
c('delta','Statistics & Time','Intermediate','Compute differences between consecutive values.','index=metrics | sort 0 _time | delta bytes_total AS bytes_change','A per-event change in the counter.','Counter resets can yield negative changes; handle them in your analysis.');
c('accum','Statistics & Time','Intermediate','Produce a running cumulative sum of a numeric field.','index=orders | sort 0 _time | accum revenue AS running_revenue','Cumulative revenue as events progress.','Sort chronologically first for meaningful trends.');
c('autoregress','Statistics & Time','Advanced','Add lagged values from earlier events in pipeline order.','index=metrics | sort 0 _time | autoregress cpu AS cpu_prev p=1','Each event gains the previous CPU value.','Global lag can mix hosts; isolate or group data before using it.');
c('predict','Statistics & Time','Expert','Estimate a time-series forecast from past observations.','index=web | timechart span=1h count AS requests | predict requests future_timespan=12','A projected request series for a future time horizon.','Validate forecasts against historical patterns; prediction is not certainty.');
c('anomalydetection','Statistics & Time','Expert','Score unusual events with statistical anomaly detection.','index=web | anomalydetection action=annotate','Events augmented with anomaly-related fields.','Inspect feature quality, normal seasonality and false positives.');
c('rare','Statistics & Time','Intermediate','Find least common field-value combinations.','index=auth | rare limit=10 src_ip','Ten least-common source IP values.','A rare value is not automatically malicious.');
c('top','Statistics & Time','Beginner','Show the most common field values.','index=web | top limit=10 uri','The ten most frequently observed paths.','For flexible aggregations, use stats and sort instead.');
c('tstats','Statistics & Time','Expert','Fast statistics over indexed fields or accelerated data models.','| tstats count WHERE index=web BY host sourcetype','Counts grouped by indexed host and sourcetype.','Not every search-time field is accessible; check indexed fields and acceleration.','SPL','Command',['tstats reads indexed metadata instead of full raw-event extraction.','WHERE narrows the index.','BY groups values into a compact result.']);
c('mstats','Statistics & Time','Expert','Compute statistics over metrics stored in metric indexes.','| mstats avg(_value) WHERE index=infra_metrics metric_name=cpu.util BY host span=5m','Average CPU metric samples over five-minute intervals.','Requires a metric index and matching metric names; not ordinary event logs.');
c('mpreview','Statistics & Time','Advanced','Preview data points from metric indexes for troubleshooting.','| mpreview index=infra_metrics','A sample of raw metric data points.','Requires the metrics index and appropriate permissions.');
c('estdc','Statistics & Time','Expert','Estimate distinct count with lower memory cost on large datasets.','index=web | stats estdc(session_id) AS approx_sessions','Approximate number of unique sessions.','Compare with dc when exactness matters; estimates have error.','SPL','Function');
c('perc95','Statistics & Time','Advanced','Calculate an approximate 95th percentile.','index=web | stats perc95(response_ms) AS p95_ms BY uri','Per-endpoint 95th-percentile response time.','Percentiles expose slow-tail experiences that averages may hide.','SPL','Function');
c('dc','Statistics & Time','Intermediate','Count unique field values.','index=auth | stats dc(user) AS unique_users BY host','Number of distinct users by host.','High-cardinality exact distinct counts may be expensive.','SPL','Function');
c('values','Statistics & Time','Intermediate','Collect distinct field values into a multivalue result.','index=auth | stats values(action) AS actions BY user','A unique list of actions for each user.','Do not rely on values() to preserve event order.','SPL','Function');
c('list','Statistics & Time','Advanced','Collect observed values into a multivalue result.','index=auth | stats list(action) AS actions BY user','A list of action values per user.','list() has limits and event order can be affected by distributed searches.','SPL','Function');

// PARSING AND TRANSFORMATION
c('eval','Parsing & Enrichment','Beginner','Create calculated fields with eval expressions.','index=web | eval is_error=if(status>=500,1,0) | stats sum(is_error) AS errors','A count of 500-level response events.','eval expressions can use if, case, coalesce, tonumber and many other functions.');
c('rex','Parsing & Enrichment','Intermediate','Extract fields from unstructured text using named regex groups.','index=app | rex field=_raw "user=(?<username>[^ ]+)" | table username','A username field extracted from matching raw logs.','Regex patterns are examples; validate against real log formats.');
c('spath','Parsing & Enrichment','Intermediate','Extract structured fields from JSON or XML text.','index=app | spath input=_raw path=user.id output=user_id | table user_id','User IDs read from nested JSON.','In SPL2, spath also has function form; confirm input structure.');
c('extract','Parsing & Enrichment','Advanced','Apply registered field extraction rules.','index=app | extract pairdelim="," kvdelim="="','Fields parsed from key-value pairs.','Use search-time configuration for stable, repeatable parsing.');
c('kv','Parsing & Enrichment','Advanced','Alias of extract for key-value field extraction.','index=app | kv','Extractable key-value pairs become search fields.','Avoid unnecessary repeated extractions on high-volume searches.');
c('multikv','Parsing & Enrichment','Advanced','Parse table-formatted multiline events into records.','index=app | multikv','Columns in formatted multiline text become fields.','Works best only when the underlying raw data follows a consistent table format.');
c('makemv','Parsing & Enrichment','Intermediate','Split a delimited string into multiple values.','index=app | makemv delim="," roles','roles becomes a multivalue field.','Missing separators or whitespace can skew values.');
c('mvexpand','Parsing & Enrichment','Intermediate','Expand each multivalue element into its own event row.','index=app | makemv delim="," roles | mvexpand roles','One output row per role value.','Large multivalue lists can dramatically increase result counts.');
c('mvcombine','Parsing & Enrichment','Advanced','Combine results that differ in one field into multivalue rows.','index=app | fields user role | mvcombine role','Rows can share a user with a multivalue role field.','Verify what makes rows equivalent before combining them.');
c('mvzip','Parsing & Enrichment','Expert','Pair corresponding multivalue entries in eval expressions.','index=app | eval joined=mvzip(keys,values,"=")','Parallel key/value arrays are zipped by index.','Check that the arrays have aligned ordering and lengths.','SPL','Function');
c('mvfilter','Parsing & Enrichment','Advanced','Keep matching elements from a multivalue field.','index=app | eval active_roles=mvfilter(match(roles,"^admin"))','Only roles matching the admin prefix remain.','Expression is evaluated for each multivalue element.','SPL','Function');
c('lookup','Parsing & Enrichment','Intermediate','Enrich events from a configured lookup table.','index=auth | lookup user_directory user OUTPUT department | table user department','User events include department from a lookup.','Configure the lookup and key names before running this example.');
c('inputlookup','Parsing & Enrichment','Intermediate','Read records from a configured lookup directly.','| inputlookup user_directory | head 20','First twenty lookup records.','The lookup must already exist and be accessible.');
c('outputlookup','Parsing & Enrichment','Advanced','Write search results to a lookup table.','index=auth | stats count BY user | outputlookup user_counts.csv','A lookup is created or updated with user counts.','This is a write operation; run only with authorization and understand overwrite behavior.');
c('iplocation','Parsing & Enrichment','Intermediate','Enrich public IPs with approximate geographic attributes.','index=web | iplocation clientip | stats count BY Country','Web events counted by geolocated country.','Geolocation is approximate and is often missing for private IPs.');
c('geostats','Parsing & Enrichment','Advanced','Aggregate events geographically for map visualizations.','index=web | iplocation clientip | geostats count BY status','Aggregated coordinates suitable for a geographic visualization.','Location quality depends on geolocation data and field coverage.');
c('convert','Parsing & Enrichment','Intermediate','Convert field representations such as time formats.','index=web | convert ctime(_time) AS readable_time','Epoch timestamps become human-readable values.','Keep native _time for time-based calculations.');
c('strptime','Parsing & Enrichment','Intermediate','Parse a formatted timestamp string into epoch seconds.','index=app | eval parsed=strptime(timestamp,"%Y-%m-%d %H:%M:%S")','A numeric epoch field for date calculations.','The format string must match source timestamps.','SPL','Function');
c('strftime','Parsing & Enrichment','Beginner','Format epoch time into a human-readable string.','index=app | eval day=strftime(_time,"%Y-%m-%d")','A YYYY-MM-DD date field.','Always consider timezone when interpreting formatted dates.','SPL','Function');
c('coalesce','Parsing & Enrichment','Intermediate','Choose the first non-null value across alternatives.','index=auth | eval actor=coalesce(user,username,account)','One normalized actor field from alternate names.','Useful in CIM normalization when sources use different field names.','SPL','Function');
c('case','Parsing & Enrichment','Intermediate','Create multi-condition classification logic.','index=web | eval severity=case(status>=500,"high",status>=400,"medium",true(),"low")','Every web event receives a severity label.','Put the most specific conditions before broader ones.','SPL','Function');
c('if','Parsing & Enrichment','Beginner','Choose one result when true and another when false.','index=web | eval outcome=if(status<400,"ok","review")','Each response is tagged ok or review.','Use case() for several conditions.','SPL','Function');
c('match','Parsing & Enrichment','Advanced','Return whether a text field matches a regular expression.','index=web | eval api_path=if(match(uri,"^/api/"),1,0)','Boolean-like flag for API paths.','Regex is powerful, but could be unnecessary for exact values.','SPL','Function');
c('like','Parsing & Enrichment','Intermediate','Compare a string to wildcard patterns in an eval expression.','index=web | where like(uri,"/api/%")','Only paths beginning with /api/.','Uses % and _ wildcards, not SPL search wildcards.','SPL','Function');
c('relative_time','Parsing & Enrichment','Advanced','Round or shift timestamps relative to another epoch time.','index=web | eval start_day=relative_time(_time,"@d")','Every event gains its calendar-day start timestamp.','Interpret snapped times in the expected timezone.','SPL','Function');
c('tonumber','Parsing & Enrichment','Intermediate','Convert numeric-looking strings to numeric values.','index=app | eval duration_ms=tonumber(duration_ms)','A numerical duration field for calculations.','Invalid strings may result in null.','SPL','Function');
c('tostring','Parsing & Enrichment','Intermediate','Convert field values to strings and formatted representations.','index=app | eval duration_label=tostring(duration_ms,"duration")','A formatted label for numeric durations.','Formatting choices should match the units of your field.','SPL','Function');
c('round','Parsing & Enrichment','Beginner','Round numeric values to a given precision.','index=web | stats avg(response_ms) AS avg_ms | eval avg_ms=round(avg_ms,2)','Average time rounded to two decimal places.','Round final reports rather than prematurely rounding inputs.','SPL','Function');
c('json_extract','Parsing & Enrichment','Advanced','Extract a value from a JSON document field.','index=app | eval user_id=json_extract(payload,"user.id")','User identifier read from a nested JSON field.','Confirm the JSON syntax and result type.','SPL','Function');

// CORRELATION / COMPLEX SEARCHES
c('transaction','Correlation & Advanced','Advanced','Group related events into logical multi-event sessions.','index=auth | transaction session_id maxspan=30m','Combined sessions with event counts and durations.','Often memory-expensive; use stats-based grouping on large volumes.');
c('join','Correlation & Advanced','Advanced','Combine results with a secondary dataset on matching keys.','index=orders | stats sum(amount) AS total BY user | join type=left user [search index=profiles | stats latest(tier) AS tier BY user]','Per-user spending enriched with a profile tier.','Subsearch limits and join cost can surprise; prefer lookup or stats when possible.');
c('append','Correlation & Advanced','Intermediate','Append result rows from a subsearch.','index=web | stats count AS n | eval source="web" | append [search index=auth | stats count AS n | eval source="auth"]','Two summary rows for separate indexes.','Mind subsearch time and result limits.');
c('appendcols','Correlation & Advanced','Advanced','Append fields horizontally by row position.','index=web | stats count AS web_events | appendcols [search index=auth | stats count AS auth_events]','Side-by-side totals on the same row.','Row-order coupling makes this unsuitable for general key-based joins.');
c('appendpipe','Correlation & Advanced','Advanced','Run a subpipeline and add its results to the current result set.','index=web | stats count BY host | appendpipe [stats sum(count) AS count | eval host="TOTAL"]','Per-host counts plus a total row.','An efficient way to add totals without another raw-data search.');
c('union','Correlation & Advanced','Expert','Merge datasets or searches into a common result set.','| union [search index=web | fields _time host] [search index=auth | fields _time host]','A combined result stream from two indexes.','Check schema alignment and product-specific syntax.');
c('map','Correlation & Advanced','Expert','Execute a parameterized search for each incoming result row.','| makeresults | eval host="demo-host" | map maxsearches=1 search="search index=web host=$host$ | stats count"','One secondary search with a demo host condition.','Resource-intensive; avoid user-controlled tokens and high maxsearches.');
c('foreach','Correlation & Advanced','Advanced','Run a template operation against many matching fields.','index=metrics | foreach cpu_* [eval <<FIELD>>=round(<<FIELD>>,1)]','All cpu_* fields rounded consistently.','Field wildcards and substitution tokens need careful testing.');
c('filldown','Correlation & Advanced','Intermediate','Propagate the last non-null field value down later results.','index=app | sort 0 _time | filldown session_id','Later events inherit the most recent session_id.','Only safe when pipeline order and group boundaries are well defined.');
c('xyseries','Correlation & Advanced','Advanced','Convert rows into a matrix suitable for charts.','index=web | stats count BY host status | xyseries host status count','A host-by-status matrix.','Duplicate combinations need correct pre-aggregation.');
c('untable','Correlation & Advanced','Advanced','Transform a wide table into row-oriented key/value pairs.','index=web | stats count BY status | untable status metric value','Metric/value rows generated from columns.','Make sure the table shape matches the intended transformation.');
c('transpose','Correlation & Advanced','Intermediate','Rotate rows and columns in a result table.','index=web | stats count AS requests avg(response_ms) AS avg_ms | transpose','A vertical representation of summary metrics.','Often suited to presentation rather than large-event searches.');
c('selfjoin','Correlation & Advanced','Expert','Combine rows within a dataset using a common key.','index=auth | fields session_id user action | selfjoin session_id','Matching rows joined on a shared session_id, when multiple records exist.','Self-joins can grow quickly; stats is usually better for grouped action summaries.');
c('set','Correlation & Advanced','Expert','Compare two result sets using union, intersect or diff operations.','| set intersect [search index=auth | fields user] [search index=access | fields user]','User identifiers present in both sets.','Subsearch limits apply; investigate joins and lookups for large datasets.');
c('return','Correlation & Advanced','Advanced','Return subsearch values to the outer search.','index=auth [search index=watchlist | stats values(user) AS user | return 20 user]','Authentication events matched to returned user constraints.','Subsearch result limits and formatting are important.');

// COMMANDS FOR TEST DATA / TROUBLESHOOTING
c('makeresults','Simulation & Diagnostics','Beginner','Generate synthetic events without an external data source.','| makeresults count=4 | streamstats count AS event_no | eval status=if(event_no%2=0,500,200)','Four artificial rows for experimenting with SPL.','Great for classroom exercises; these are not live logs.');
c('gentimes','Simulation & Diagnostics','Advanced','Generate a sequence of dates and times for testing.','| gentimes start=-3 end=1 increment=1d','A row for each generated date/time increment.','Generates synthetic data; validate arguments for your environment.');
c('rest','Simulation & Diagnostics','Expert','Query authorized Splunk REST endpoints through search.','| rest /services/server/info | table serverName version','Server version information when permitted.','Requires relevant capabilities; endpoint access is permission-controlled.');
c('dbinspect','Simulation & Diagnostics','Expert','Inspect index bucket metadata.','| dbinspect index=web | table bucketId state rawSize','Selected index bucket metadata.','May require administrative access; inspect read-only before tuning.');
c('jobinspect','Simulation & Diagnostics','Expert','Inspect execution statistics for the current search job.','index=web | stats count | jobinspect','Diagnostic information about the search job.','Use with Job Inspector to diagnose expensive pipelines.');
c('loadjob','Simulation & Diagnostics','Advanced','Reuse a saved/completed search job by ID.','| loadjob savedsearch="admin:search:Daily Web Report"','Results from a completed scheduled report, when available.','Requires an existing job or saved-search identifier and access.');
c('savedsearch','Simulation & Diagnostics','Intermediate','Invoke a named saved search from SPL.','| savedsearch "Daily Web Report"','Results of the configured saved search.','The saved search must exist and be shared appropriately.');
c('noop','Simulation & Diagnostics','Advanced','Apply no-op or advanced command-specific options to pipeline processing.','index=web | noop | stats count','Event count following a no-op stage.','Some noop settings are advanced; avoid copying obscure options into production.');

// SPL2 FEATURES — deliberately separated to avoid mixing incompatible syntaxes
c('from (SPL2)','SPL2 Modern Features','Advanced','Use SPL2 FROM with SQL-style clauses to read datasets.','$orders = FROM main WHERE status=500 SELECT host, status LIMIT 10','Ten matching rows from the named dataset in an SPL2 module.','SPL2 module search names and dataset availability differ by interface.','SPL2');
c('search (SPL2)','SPL2 Modern Features','Intermediate','Use the explicit SPL2 search generating command.','$errors = search index=web status=500 | stats count() AS error_count','An SPL2 named search returning an error count.','An explicit search is required in an SPL2 module; syntax may differ in the Search bar.','SPL2');
c('stats (SPL2 span)','SPL2 Modern Features','Expert','Use SPL2 stats with BY time span; this differs from SPL stats.','$trends = search index=web | stats count() BY _time span=5m','Five-minute event counts from an SPL2 search.','Use bin then stats for equivalent SPL behavior.','SPL2');
c('branch (SPL2)','SPL2 Modern Features','Expert','Fork results into multiple named paths for reusable analysis.','branch','Separate paths from one input dataset in an SPL2 pipeline.','Syntax and support depend on product and editor. Open SPL2 docs for the full branch grammar.','SPL2');
c('into (SPL2)','SPL2 Modern Features','Expert','Write results into a writable dataset in supported SPL2 environments.','into target_dataset','Results written to the destination dataset, if authorized.','This changes data. Shown as conceptual syntax; confirm required clauses, destination and permissions in product docs.','SPL2');
c('thru (SPL2)','SPL2 Modern Features','Expert','Write a result set to a destination, then pass it to the next command.','... | thru actions | eval review_status="new"','Data is written and continues through the pipeline.','Writing requires an authorized destination; do not test on production data.','SPL2');
c('ocsf (SPL2)','SPL2 Modern Features','Expert','Convert or map event fields with OCSF-related processing.','ocsf','OCSF-normalized event structure when correctly configured.','Support, schema and required arguments are product-specific. Use official reference before execution.','SPL2');
c('spl1 (SPL2)','SPL2 Modern Features','Expert','Embed supported classic SPL commands in an SPL2 search.','spl1','Allows some classic SPL syntax inside supported SPL2 contexts.','Not all SPL commands are embeddable; spl1 is not supported in pipelines. Read official syntax.','SPL2');
c('flatten (SPL2)','SPL2 Modern Features','Advanced','Flatten nested or structured fields into top-level fields.','flatten','Nested values represented as flatter fields.','Use an official product-specific example to supply correct field names and options.','SPL2');
c('route (SPL2)','SPL2 Modern Features','Expert','Route records to pipeline destinations under supported conditions.','route','Events directed to the configured destination or route.','Primarily a pipeline/data-routing capability; confirm compatibility in SPL2 docs.','SPL2');

// PLATFORM AND PROFESSIONAL PRACTICE CONCEPTS
const concept = (name, category, level, definition, example, expected, tip) => c(name,category,level,definition,example,expected,tip,'Concept','Concept');
concept('Indexer','Splunk Architecture','Beginner','Stores searchable event data in index buckets and participates in distributed searches.','index=_internal | stats count BY host','Internal events grouped by the hosts that sent them.','Indexer clusters provide replication and search availability when configured.');
concept('Search Head','Splunk Architecture','Beginner','Coordinates searches and provides the user-facing search experience.','index=_internal | stats count BY sourcetype','An example of the SPL queries a search head coordinates.','Search Head Clusters share knowledge objects and add availability.');
concept('Universal Forwarder','Splunk Architecture','Intermediate','Lightweight agent for collecting and forwarding data to Splunk receivers.','index=_internal sourcetype=splunkd | stats count BY host','A sample way to inspect internal Splunk events where configured.','UF is not a full heavy-parsing processor.');
concept('Heavy Forwarder','Splunk Architecture','Advanced','Full Splunk Enterprise instance capable of parsing, filtering and routing event data.','index=_internal | stats count BY host','Internal event volume grouped by hosts.','Use HF when filtering/routing requirements cannot be met by simpler collection.');
concept('Indexer Cluster','Splunk Architecture','Expert','A group of indexers configured for replication and searchable copies.','| rest /services/cluster/master/info','Cluster information, for authorized environments and supported endpoints.','Cluster health and search factor are administrative concerns; endpoint paths vary by version.');
concept('Search Head Cluster','Splunk Architecture','Advanced','Multiple search heads coordinated to share apps and knowledge objects.','| rest /services/server/info | table serverName','Server information to begin a platform health check.','Deployers distribute certain configuration types; plan rollout carefully.');
concept('Sourcetype','Data Ingestion','Beginner','Label describing incoming event format and parsing rules.','index=web | stats count BY sourcetype','Data volume by sourcetype.','Correct sourcetypes improve timestamps and extractions.');
concept('Index','Data Ingestion','Beginner','Logical store for event data with retention and access policies.','index=web earliest=-1d | stats count','Web-index events over the selected time range.','Choose a real index; web is an example.');
concept('HEC (HTTP Event Collector)','Data Ingestion','Advanced','API-style mechanism for applications to ingest events and metrics.','index=app | stats count BY sourcetype','Example validation of ingested application events.','Store HEC tokens securely, outside frontend code.');
concept('props.conf','Data Ingestion','Advanced','Configuration file controlling line breaking, timestamp recognition and search-time field handling.','index=_internal | stats count BY sourcetype','A basic starting point for inspecting internal sources.','Actual props.conf tuning happens in Splunk configuration, not via SPL.');
concept('transforms.conf','Data Ingestion','Advanced','Configuration file for regex transformations, extractions and some routing behavior.','index=app | fieldsummary','A search to review extracted fields after configuration.','Configuration location and precedence matter; test on staging data.');
concept('btool','Simulation & Diagnostics','Expert','Splunk CLI utility that displays the effective layered configuration.','splunk btool props list --debug','Effective props configuration with its originating files.','Run this in an authorized Splunk host shell, NOT the SPL search bar.');
concept('splunkd','Simulation & Diagnostics','Intermediate','Main Splunk service process; its logs help diagnose system issues.','index=_internal sourcetype=splunkd | stats count BY log_level','Splunk service logging volume by severity.','Field availability varies; raw splunkd.log resides under $SPLUNK_HOME/var/log/splunk.');
concept('Data Model Acceleration','Performance & Governance','Expert','Precomputed summaries that can speed qualifying data-model searches.','| tstats count FROM datamodel=Authentication.Authentication BY Authentication.action','Action counts from the example Authentication data model.','Requires installed CIM models and properly configured acceleration.');
concept('CIM (Common Information Model)','Performance & Governance','Advanced','Common field names and data models for cross-source analytics.','index=auth | stats count BY action user src','Illustrative normalized authentication event summary.','CIM fields require correct tags, event types and mapping.');
concept('Search Optimization','Performance & Governance','Advanced','Reduce scan size, unnecessary fields and expensive commands.','index=web earliest=-1h status=500 | fields _time host uri','Narrowed one-hour error events with only needed fields.','Prefer base constraints, inspect Job Inspector and compare equivalent searches.');
concept('Summary Indexing','Performance & Governance','Advanced','Persist scheduled summary results so dashboards query less raw data.','index=summary | stats sum(requests) BY host','Pre-aggregated counts grouped by host, if summary events exist.','Must configure a summary collection pipeline; summary indexes do not populate themselves.');
concept('RBAC','Performance & Governance','Advanced','Role-based access control governs searches, indexes and admin capabilities.','| rest /services/authentication/current-context','Your current Splunk access context, when permission allows.','Do not assume dashboard users can search every index.');
concept('Dashboard Tokens','Dashboards & Alerts','Intermediate','Parameters used by dashboard inputs, searches and drilldowns.','index=web host=$selected_host$ | stats count','A host-filtered panel once a token is populated.','Tokens are dashboard placeholders, not literal SPL values in ordinary searches.');
concept('Dashboard Studio','Dashboards & Alerts','Advanced','Modern visualization experience for Splunk dashboards.','index=web | timechart span=1h count BY status','Hourly series usable in a chart panel.','Build with a stable search schema and consistent input tokens.');
concept('Base Search','Dashboards & Alerts','Advanced','Reusable search data powering several post-process dashboard views.','index=web earliest=-24h | fields _time host status','A lightweight base event set for downstream panels.','Post-process searches depend on base-search results and retention limits.');
concept('Drilldown','Dashboards & Alerts','Intermediate','A user interaction that passes context from a chart to deeper detail.','index=web status=500 | stats count BY host','Host-level error chart to drive a filtered detail view.','Validate token escaping and limit what user-controlled values can trigger.');
concept('Scheduled Report','Dashboards & Alerts','Intermediate','Saved SPL that runs periodically for a report or dashboard cache.','index=web earliest=-1d | stats count BY host','Daily grouped request counts.','Schedule relative to data arrival delays and quota limits.');
concept('Alert Throttling','Dashboards & Alerts','Advanced','Suppress repeat alert notifications within a configured time window.','index=auth action=failure | stats count BY user | where count>=10','Users with repeated failures eligible for a tuned alert.','Alert suppression is configured separately from SPL.');
concept('Correlation Search','Security & SOC','Advanced','Detection search that correlates signals into security findings or alerts.','index=auth action=failure | stats count AS failures BY user src | where failures>=10','Possible password-guessing candidates needing further context.','Thresholds are examples and require false-positive tuning.');
concept('Risk-Based Alerting (RBA)','Security & SOC','Expert','Prioritize entities by accumulating risk signals and context over time.','index=risk | stats sum(risk_score) AS total_risk BY risk_object | sort - total_risk','Entities ranked by cumulative risk score, for compatible ES event schemas.','Splunk ES versions can differ in data models and field names.');
concept('Finding / Finding Group','Security & SOC','Advanced','Modern Enterprise Security investigation objects grouping related detections.','index=notable | stats count BY rule_name','Counts by rule when the notable index and fields are available.','ES 8.x uses findings and finding groups; older materials emphasize notable events.');
concept('Notable Event (Legacy ES term)','Security & SOC','Intermediate','Historical ES term for events requiring triage, still encountered in older environments.','index=notable | stats count BY rule_name','Counts of notable-index events, where accessible.','For current ES 8 workflows, teach findings and investigations too.');
concept('MITRE ATT&CK Mapping','Security & SOC','Advanced','Link detection logic to documented adversary tactics and techniques.','index=auth | stats count BY action src user','Normalized authentication behaviors for a detection investigation.','A mapping is evidence-based context, not proof of an attack.');
concept('Entity Investigation','Security & SOC','Expert','Explore related asset/user activity across security data sources.','index=auth user="example.user" | stats count BY src action','Activity breakdown for a single example identity.','Respect access controls and corroborate findings across independent logs.');
concept('Data Onboarding Validation','Data Ingestion','Intermediate','Check that new sources have fresh timestamps, expected volume and usable fields.','index=web earliest=-24h | stats count latest(_time) AS last_seen BY host sourcetype | convert ctime(last_seen)','Per-host and sourcetype counts and last observed event times.','Check ingestion delay separately from event timestamp.');
concept('License / Ingest Monitoring','Performance & Governance','Advanced','Observe ingest growth and its cost or license impact.','index=_internal source=*license_usage.log type=Usage | stats sum(b) AS bytes BY idx','Approximate indexed usage grouped by index when license logs exist.','License log format/availability varies across deployments and cloud products.');

export const DICTIONARY_ITEMS = entries;

export const LEARNING_PATHS = [
  { id:'search', title:'Search fundamentals', description:'Find the right data and build clear tables.', items:['search','where','fields','table','stats','timechart'] },
  { id:'analytics', title:'Advanced SPL analytics', description:'Move from aggregation to time-series and accelerated search.', items:['eventstats','streamstats','bin','tstats','mstats','transaction'] },
  { id:'engineer', title:'Data engineering', description:'Normalize, extract, enrich and validate ingestion.', items:['rex','spath','lookup','CIM (Common Information Model)','props.conf','Data Onboarding Validation'] },
  { id:'soc', title:'SOC detection engineer', description:'Build and tune analytical detections and entity investigations.', items:['Correlation Search','Risk-Based Alerting (RBA)','Finding / Finding Group','MITRE ATT&CK Mapping','Entity Investigation','Alert Throttling'] },
  { id:'spl2', title:'Modern SPL2', description:'Learn what is new and where the syntax differs.', items:['from (SPL2)','search (SPL2)','stats (SPL2 span)','branch (SPL2)','into (SPL2)','thru (SPL2)'] },
];

export const LABS = [
  { id:'errors', title:'Investigate a spike in web errors', level:'Intermediate', category:'Search & Filtering', question:'Which endpoints cause the most HTTP 5xx responses?', goal:'Find the most affected endpoints', query:'index=web earliest=-1h status>=500 | stats count AS errors BY uri | sort - errors | head 10', steps:['Search a one-hour window of web events with server-error codes.','Count events per endpoint using stats.','Sort descending and keep the ten largest groups.'], expected:'A ranked table of endpoints by error frequency.', caveat:'This is a teaching example. Replace web and uri with your actual index and field names.' },
  { id:'failures', title:'Investigate repeat login failures', level:'Advanced', category:'Security & SOC', question:'Which users and sources have repeated authentication failures?', goal:'Find suspicious authentication patterns', query:'index=auth earliest=-30m action=failure | stats count AS failures dc(src) AS source_count BY user | where failures>=10 | sort - failures', steps:['Restrict to recent failed authentication events.','Count failures and distinct sources by user.','Filter high-frequency patterns for review.'], expected:'Candidate user accounts for further validation, not proof of compromise.', caveat:'Tune thresholds and field mapping to normal account behavior and data quality.' },
  { id:'latency', title:'Monitor slow API responses', level:'Advanced', category:'Statistics & Time', question:'Which routes have high 95th-percentile response time?', goal:'Understand tail latency', query:'index=web earliest=-24h uri="/api/*" | stats count AS requests perc95(response_ms) AS p95_ms BY uri | where requests>=20 | sort - p95_ms', steps:['Select API events in a bounded time range.','Calculate per-route volumes and 95th percentiles.','Exclude tiny samples and rank slow routes.'], expected:'Routes ordered by their approximate slow-tail response times.', caveat:'Ensure response_ms is numeric and sample sizes are adequate.' },
  { id:'accelerate', title:'Use indexed metadata for speed', level:'Expert', category:'Statistics & Time', question:'Can you count events by host without raw field extraction?', goal:'Understand fast indexed-field statistics', query:'| tstats count WHERE index=web BY host sourcetype', steps:['Use tstats rather than a full raw-event search.','Limit reads to the web index.','Group only by indexed metadata fields.'], expected:'Fast summary counts by host and sourcetype.', caveat:'Only indexed fields or accelerated model fields can be used here.' },
  { id:'correlate', title:'Identify unusual activity sequences', level:'Expert', category:'Correlation & Advanced', question:'Which accounts saw a failure immediately before a success?', goal:'Practice windowed event correlation', query:'index=auth earliest=-24h | sort 0 user _time | streamstats current=f last(action) AS previous BY user | where previous="failure" AND action="success" | table _time user src', steps:['Order authentication actions chronologically by user.','Keep the previous action per user.','Filter failure-to-success transitions.'], expected:'Successful logins that directly followed a failed attempt for the same user.', caveat:'This pattern alone does not prove a breach. Validate sessions, hosts and source data.' },
  { id:'spl2', title:'Compare SPL and SPL2', level:'Expert', category:'SPL2 Modern Features', question:'How does SPL2 make time buckets inside stats?', goal:'Learn dialect differences', query:'$hourly = search index=web | stats count() BY _time span=1h', steps:['Name the query in the SPL2 module editor.','Use the search generating command.','Apply a span inside SPL2 stats, unlike classic SPL stats.'], expected:'An hourly count from the named SPL2 search.', caveat:'SPL2 features depend on your deployment and editor; use bin with stats in SPL.' },
];

export const QUIZ = [
  { q:'Which command preserves each event while attaching an aggregate?', options:['stats','eventstats','top','chart'], answer:1, detail:'eventstats computes statistics but retains event-level rows.' },
  { q:'Which command usually helps use accelerated data models or indexed fields efficiently?', options:['rex','transaction','tstats','mvexpand'], answer:2, detail:'tstats reads tsidx-backed indexed or accelerated data.' },
  { q:'Which SPL command extracts a named value using regular expressions?', options:['rex','regex','sort','head'], answer:0, detail:'rex extracts fields; regex filters events.' },
  { q:'What happens when stats groups events by host?', options:['It always preserves raw events','It summarizes to grouped rows','It writes to disk','It creates a lookup'], answer:1, detail:'stats is a transforming command.' },
  { q:'Which command is best for calculating a rolling value in event order?', options:['table','streamstats','rename','inputlookup'], answer:1, detail:'streamstats calculates running and window-based values in input order.' },
  { q:'Which statement about SPL2 is correct?', options:['It always uses classic SPL syntax','Every SPL2 command works in every pipeline','It can use SQL-style clauses and adds new commands','It cannot run stats'], answer:2, detail:'SPL2 adds capabilities such as FROM and data-preparation commands, with compatibility varying by product.' },
  { q:'Which SPL function can combine alternate username fields?', options:['strptime','coalesce','perc95','dc'], answer:1, detail:'coalesce returns the first available non-null value.' },
  { q:'Which technique is safer for reducing costly search work?', options:['Search every index','Narrow index and time early','Join every dataset','Always expand multivalue fields'], answer:1, detail:'Early constraints reduce scanned data and downstream computation.' },
  { q:'Which item is NOT an SPL search-bar command?', options:['stats','btool','where','tstats'], answer:1, detail:'btool is a command-line configuration diagnostic.' },
  { q:'Which object is emphasized in modern Enterprise Security 8 investigations?', options:['Finding and finding group','Only notable events','Only raw events','Only source type'], answer:0, detail:'Modern ES interfaces use findings and investigations, while older deployments still refer to notables.' },
];


/**
 * Drop-in educational UI; does not connect to a Splunk instance and does NOT
 * execute student queries. Examples are educational templates only.
 * Requires: React, lucide-react, Tailwind CSS.
 */
const saveKey = 'toanalytics.splunkDictionary.v2';
const CATEGORY_ALL = 'All topics';
const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIALECTS = ['All languages', 'SPL', 'SPL2', 'Concept'];
const TABS = [
  { value:'reference', label:'Command reference', icon:BookOpen },
  { value:'paths', label:'Learning paths', icon:GraduationCap },
  { value:'labs', label:'Case study labs', icon:TerminalSquare },
  { value:'quiz', label:'Knowledge check', icon:Brain },
];
const DIFFICULTY = {
  Beginner:'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  Intermediate:'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  Advanced:'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  Expert:'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300',
};
const SKILL_ORDER = {Beginner:1,Intermediate:2,Advanced:3,Expert:4};
const INTERVIEW = {
  stats:'How does stats differ from eventstats and streamstats when you need event-level context?',
  tstats:'When would tstats be faster than stats, and which fields are eligible?',
  transaction:'Why can transaction exhaust resources, and when is stats a better replacement?',
  rex:'Explain the difference between rex and regex, using a log parsing example.',
  'from (SPL2)':'What SQL-style features does SPL2 FROM add, and where might syntax differ?',
  'Risk-Based Alerting (RBA)':'How do risk signals across detections become prioritized findings?',
  'CIM (Common Information Model)':'Why is normalization important to cross-sourcetype detection content?',
  'Data Model Acceleration':'What are acceleration prerequisites and how does tstats benefit?',
};
const COMPARE = [
  {left:'stats',right:'eventstats',answer:'stats returns a summary table. eventstats appends summary values to every original event.'},
  {left:'stats',right:'streamstats',answer:'stats groups all matching input. streamstats works in event order for running/window calculations.'},
  {left:'rex',right:'regex',answer:'rex extracts new fields. regex removes events that do not match a pattern.'},
  {left:'transaction',right:'stats',answer:'transaction groups individual event sequences; stats is often faster for large summaries.'},
  {left:'SPL',right:'SPL2',answer:'SPL2 adds SQL-style syntax and dataset/data-pipeline features. Commands differ by runtime and product.'},
];

function loadPreferences() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(saveKey) || '{}') || {}; }
  catch { return {}; }
}
function readSet(value) { return Array.isArray(value) ? new Set(value) : new Set(); }
function prettyCount(n) { return new Intl.NumberFormat('en-US').format(n); }
function docFor(item) {
  if (item?.language === 'SPL2') return DOCS.spl2;
  if (item?.category === 'Security & SOC') return DOCS.security;
  return DOCS.spl;
}
function Pill({children,className=''}) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>{children}</span>;
}
function Button({children,icon:Icon,variant='outline',className='',...props}) {
  const variants = {
    outline:'border border-slate-200 bg-white text-slate-700 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-fuchsia-500 dark:hover:text-white',
    primary:'border border-fuchsia-500 bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-sm shadow-fuchsia-700/20',
    ghost:'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };
  return <button type="button" {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>
    {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}{children}
  </button>;
}
function EmptyState({title,description,onReset}) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center dark:border-slate-700">
    <Search className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
    <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {onReset && <Button onClick={onReset} className="mt-5">Clear filters</Button>}
  </div>;
}
function Mono({children}) {
  return <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-4 font-mono text-xs leading-6 text-cyan-100 sm:text-sm whitespace-pre-wrap break-words">{children}</pre>;
}

export default function SplunkDictionary() {
  const [prefs] = useState(loadPreferences);
  const [dark,setDark] = useState(prefs.dark !== false);
  const [favorites,setFavorites] = useState(() => readSet(prefs.favorites));
  const [mastered,setMastered] = useState(() => readSet(prefs.mastered));
  const [tab,setTab] = useState('reference');
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState(CATEGORY_ALL);
  const [level,setLevel] = useState('All levels');
  const [dialect,setDialect] = useState('All languages');
  const [onlyFavorites,setOnlyFavorites] = useState(false);
  const [sort,setSort] = useState('name');
  const [pageSize,setPageSize] = useState(24);
  const [selectedId,setSelectedId] = useState(DICTIONARY_ITEMS.find(x => x.name === 'tstats')?.id || DICTIONARY_ITEMS[0]?.id);
  const [activePath,setActivePath] = useState(LEARNING_PATHS[0].id);
  const [activeLab,setActiveLab] = useState(LABS[0].id);
  const [showSolution,setShowSolution] = useState(false);
  const [quizIndex,setQuizIndex] = useState(0);
  const [quizAnswer,setQuizAnswer] = useState(null);
  const [correctAnswers,setCorrectAnswers] = useState(0);
  const [quizFinished,setQuizFinished] = useState(false);
  const [toast,setToast] = useState('');
  const [filtersOpen,setFiltersOpen] = useState(false);
  const searchRef = useRef(null);
  const detailRef = useRef(null);

  const categories = useMemo(() => [CATEGORY_ALL,...new Set(DICTIONARY_ITEMS.map(x => x.category))],[]);
  const selected = useMemo(() => DICTIONARY_ITEMS.find(x => x.id === selectedId) || DICTIONARY_ITEMS[0], [selectedId]);
  const activePathData = LEARNING_PATHS.find(x => x.id === activePath) || LEARNING_PATHS[0];
  const activeLabData = LABS.find(x => x.id === activeLab) || LABS[0];
  const commandCount = useMemo(() => DICTIONARY_ITEMS.filter(x => x.kind === 'Command').length,[]);
  const remaining = DICTIONARY_ITEMS.length - mastered.size;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {window.localStorage.setItem(saveKey,JSON.stringify({ dark,favorites:[...favorites],mastered:[...mastered] }));}
    catch { /* Private mode / disabled storage: component still works */ }
  },[dark,favorites,mastered]);
  useEffect(() => { setPageSize(24); },[query,category,level,dialect,sort,onlyFavorites]);
  useEffect(() => {
    const keyHandler = e => {
      const isTyping = ['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable;
      if(e.key === '/' && !isTyping) {e.preventDefault();setTab('reference');searchRef.current?.focus();}
      if(e.key === 'Escape' && document.activeElement === searchRef.current) searchRef.current?.blur();
    };
    if(typeof window !== 'undefined') window.addEventListener('keydown',keyHandler);
    return () => { if(typeof window !== 'undefined') window.removeEventListener('keydown',keyHandler); };
  },[]);
  useEffect(() => {
    if(!toast) return;
    const timer = setTimeout(() => setToast(''),2200);
    return () => clearTimeout(timer);
  },[toast]);

  const filtered = useMemo(() => {
    const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = DICTIONARY_ITEMS.filter(item => {
      if(category !== CATEGORY_ALL && item.category !== category) return false;
      if(level !== 'All levels' && item.level !== level) return false;
      if(dialect !== 'All languages' && item.language !== dialect) return false;
      if(onlyFavorites && !favorites.has(item.id)) return false;
      const text=[item.name,item.definition,item.category,item.level,item.example,item.expected,item.tip,item.kind].join(' ').toLowerCase();
      return words.every(word => text.includes(word));
    });
    matches.sort((a,b) => {
      if(sort === 'level') return (SKILL_ORDER[a.level] - SKILL_ORDER[b.level]) || a.name.localeCompare(b.name);
      if(sort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      if(sort === 'mastery') return Number(mastered.has(a.id)) - Number(mastered.has(b.id)) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    return matches;
  },[query,category,level,dialect,onlyFavorites,favorites,sort,mastered]);

  function switchSet(setter,id) {setter(prev => {const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;});}
  function resetFilters() {setQuery('');setCategory(CATEGORY_ALL);setLevel('All levels');setDialect('All languages');setOnlyFavorites(false);setSort('name');}
  function openItem(id) {
    setSelectedId(id);setTab('reference');
    if(typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),40);
    }
  }
  async function copy(value,label='Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(value);
      setToast(label);
    } catch { setToast('Clipboard unavailable: select the code to copy it'); }
  }
  function resetQuiz() {setQuizIndex(0);setQuizAnswer(null);setCorrectAnswers(0);setQuizFinished(false);}
  function nextQuiz() {
    if(quizAnswer === null) return;
    if(quizIndex + 1 >= QUIZ.length) setQuizFinished(true);
    else {setQuizIndex(x => x + 1);setQuizAnswer(null);}
  }
  const selectedQuiz = QUIZ[quizIndex];
  const selectStyles='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-fuchsia-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  const surface='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90';
  const sectionLabel='text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400';

  return (
    <div className={dark?'dark':''}>
      <div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900 selection:bg-fuchsia-500/20 dark:bg-[#080e1c] dark:text-slate-100">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <header className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#10172a] sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-300"><Sparkles className="h-3.5 w-3.5" /> T.O Analytics · Advanced learning</div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[44px]">Splunk <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">Command Academy</span></h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">An advanced searchable Splunk dictionary for analysts, SOC engineers, administrators and learners. Learn the command, see working examples, understand the output and practice the problem it solves.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2"><Pill className="border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">SPL + SPL2</Pill><Pill className="border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">2026 reference</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">Student-friendly / expert depth</Pill></div>
              </div>
              <div className="flex items-center gap-2"><Button icon={dark?Sun:Moon} onClick={() => setDark(x=>!x)} aria-label={dark?'Switch to light mode':'Switch to dark mode'}>{dark?'Light':'Dark'} mode</Button></div>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Your learning overview">
            {[
              {label:'Reference entries',value:prettyCount(DICTIONARY_ITEMS.length),icon:Layers3,hint:'Commands, functions and concepts'},
              {label:'Search commands',value:prettyCount(commandCount),icon:Code2,hint:'Curated SPL/SPL2 coverage'},
              {label:'Saved entries',value:prettyCount(favorites.size),icon:Bookmark,hint:'Stored on this browser'},
              {label:'Mastered topics',value:`${mastered.size}/${DICTIONARY_ITEMS.length}`,icon:Trophy,hint:remaining===0?'Reference completed':`${remaining} remaining`},
            ].map(({label,value,icon:Icon,hint}) => <div key={label} className={`${surface} p-4 sm:p-5`}>
              <div className="flex items-start justify-between gap-2"><span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span><Icon className="h-4 w-4 text-fuchsia-500" aria-hidden="true" /></div>
              <div className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{value}</div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>
            </div>)}
          </section>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#10172a]" role="tablist" aria-label="Learning workspace">
            <div className="flex min-w-max gap-1.5">
              {TABS.map(item => {const Icon=item.icon;return <button key={item.value} type="button" role="tab" aria-selected={tab===item.value} onClick={()=>setTab(item.value)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${tab===item.value?'bg-fuchsia-600 text-white shadow-sm':'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>;})}
            </div>
          </div>

          {tab === 'reference' && <>
            <section className={`${surface} mt-5 p-4 sm:p-5`} aria-label="Search and filters">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <label className="relative block flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search Splunk reference</span><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search stats, tstats, SPL2, CIM, response time…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none focus:border-fuchsia-500 dark:border-slate-700 dark:bg-slate-950 dark:placeholder:text-slate-500" /></label>
                <div className="flex gap-2"><Button icon={SlidersHorizontal} onClick={()=>setFiltersOpen(x=>!x)} aria-expanded={filtersOpen} className="lg:hidden">Filters</Button><Button icon={Bookmark} variant={onlyFavorites?'primary':'outline'} onClick={()=>setOnlyFavorites(x=>!x)} aria-pressed={onlyFavorites}>Bookmarks</Button><Button icon={RotateCcw} onClick={resetFilters}>Reset</Button></div>
              </div>
              <div className={`${filtersOpen?'grid':'hidden'} mt-3 gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-4`}>
                <label><span className={sectionLabel}>Topic</span><select className={`${selectStyles} mt-1.5`} value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Difficulty</span><select className={`${selectStyles} mt-1.5`} value={level} onChange={e=>setLevel(e.target.value)}>{LEVELS.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Language</span><select className={`${selectStyles} mt-1.5`} value={dialect} onChange={e=>setDialect(e.target.value)}>{DIALECTS.map(x=><option key={x}>{x}</option>)}</select></label>
                <label><span className={sectionLabel}>Sort by</span><select className={`${selectStyles} mt-1.5`} value={sort} onChange={e=>setSort(e.target.value)}><option value="name">A to Z</option><option value="level">Difficulty</option><option value="category">Topic</option><option value="mastery">Not yet mastered</option></select></label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{prettyCount(filtered.length)} matching entries</span><span>Keyboard shortcut: <kbd className="rounded border border-slate-300 px-1.5 py-0.5 dark:border-slate-700">/</kbd> to search</span></div>
            </section>

            <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
              <section aria-label="Dictionary results" className="min-w-0 space-y-3">
                {filtered.length===0 ? <EmptyState title="No matching commands" description="Try fewer keywords, another command language or a different topic." onReset={resetFilters} /> : <>
                  {filtered.slice(0,pageSize).map(item => {
                    const isSelected=selectedId===item.id, isSaved=favorites.has(item.id), isMastered=mastered.has(item.id);
                    return <article key={item.id} className={`group relative rounded-2xl border p-4 transition-colors sm:p-5 ${isSelected?'border-fuchsia-400 bg-fuchsia-50/50 shadow-sm dark:border-fuchsia-500/60 dark:bg-fuchsia-500/5':'border-slate-200 bg-white hover:border-fuchsia-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-600'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={()=>openItem(item.id)} className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-500" aria-label={`Open ${item.name} reference`}>
                          <div className="flex flex-wrap items-center gap-2"><span className="break-words font-mono text-lg font-bold tracking-tight text-slate-950 dark:text-white">{item.name}</span>{isMastered && <CheckCheck className="h-4 w-4 text-emerald-500" aria-label="Mastered" />}</div>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.definition}</p>
                        </button>
                        <button type="button" onClick={()=>switchSet(setFavorites,item.id)} aria-label={isSaved?`Remove ${item.name} bookmark`:`Bookmark ${item.name}`} aria-pressed={isSaved} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-fuchsia-500 dark:hover:bg-slate-800">{isSaved?<BookmarkCheck className="h-5 w-5 text-fuchsia-500" />:<Bookmark className="h-5 w-5" />}</button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5"><Pill className={DIFFICULTY[item.level]}>{item.level}</Pill><Pill className="border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">{item.language}</Pill><Pill className="border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">{item.category}</Pill></div>
                      <div className="mt-3 flex justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"><span className="text-xs text-slate-500 dark:text-slate-400">{item.kind}</span><button onClick={()=>openItem(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300">Read full explanation <ChevronRight className="h-3.5 w-3.5" /></button></div>
                    </article>;
                  })}
                  {filtered.length>pageSize && <Button onClick={()=>setPageSize(x=>x+24)} className="w-full py-3" icon={ChevronDown}>Load more · {filtered.length-pageSize} remaining</Button>}
                </>}
              </section>

              <aside ref={detailRef} aria-label="Selected command details" className={`${surface} min-w-0 scroll-mt-5 overflow-hidden lg:sticky lg:top-5`}>
                {selected && <>
                  <div className="border-b border-slate-200 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 px-5 py-5 dark:border-slate-800 sm:px-6">
                    <div className="mb-2 flex flex-wrap gap-2"><Pill className={DIFFICULTY[selected.level]}>{selected.level}</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">{selected.language}</Pill><Pill className="border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-300">{selected.kind}</Pill></div>
                    <h2 className="break-words font-mono text-2xl font-black tracking-tight sm:text-3xl">{selected.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.definition}</p>
                  </div>
                  <div className="max-h-[76vh] space-y-6 overflow-y-auto p-5 sm:p-6">
                    {selected.language==='SPL2' && <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3 text-xs leading-5 text-cyan-800 dark:text-cyan-200"><strong>SPL2 compatibility:</strong> Check the target Search app, module editor or data pipeline. SPL2 syntax and available commands differ by environment.</div>}
                    <div>
                      <div className="mb-2 flex items-center justify-between"><h3 className={sectionLabel}>Syntax / working example</h3><button onClick={()=>copy(selected.example,'Example copied')} className="inline-flex items-center gap-1 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-300"><Copy className="h-3.5 w-3.5" /> Copy example</button></div>
                      <Mono>{selected.example}</Mono>
                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Examples use sample indexes, field names or datasets. Replace them with the fields available in your Splunk environment.</p>
                    </div>
                    <div><h3 className={sectionLabel}>Plain-English explanation</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.definition}</p></div>
                    {selected.steps.length>0 && <div><h3 className={sectionLabel}>Step-by-step breakdown</h3><ol className="mt-3 space-y-2">{selected.steps.map((step,i)=><li className="flex gap-3 text-sm leading-6" key={i}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-300">{i+1}</span><span>{step}</span></li>)}</ol></div>}
                    <div><h3 className={sectionLabel}>Expected result</h3><p className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.expected}</p></div>
                    <div><h3 className={sectionLabel}>Expert caution / performance tip</h3><p className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.tip}</p></div>
                    <div><h3 className={sectionLabel}>Technical interview challenge</h3><p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{INTERVIEW[selected.name] || `In a production environment, when would you use ${selected.name}, how would you validate its output, and what could go wrong?`}</p></div>
                    <div className="flex flex-wrap gap-2"><Button icon={mastered.has(selected.id)?CheckCheck:Check} variant={mastered.has(selected.id)?'primary':'outline'} onClick={()=>switchSet(setMastered,selected.id)}>{mastered.has(selected.id)?'Mastered':'Mark mastered'}</Button><Button icon={favorites.has(selected.id)?BookmarkCheck:Bookmark} onClick={()=>switchSet(setFavorites,selected.id)}>{favorites.has(selected.id)?'Saved':'Bookmark'}</Button></div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800"><a href={docFor(selected)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-600 hover:underline dark:text-fuchsia-300">Official Splunk reference <ExternalLink className="h-3.5 w-3.5" /></a><Button variant="ghost" icon={Clipboard} className="!py-1.5 text-xs" onClick={()=>copy(`${selected.name}\n${selected.definition}\n\nExample:\n${selected.example}\n\nExpected:\n${selected.expected}\n\nTip:\n${selected.tip}`,'Cheat sheet copied')}>Copy notes</Button></div>
                  </div>
                </>}
              </aside>
            </div>
            <section className={`${surface} mt-5 p-5`} aria-label="Compare similar commands"><div className="mb-4 flex items-center gap-2"><Layers3 className="h-5 w-5 text-fuchsia-500" /><h3 className="font-bold">Know the differences</h3></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{COMPARE.map(pair=><div key={`${pair.left}-${pair.right}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="mb-2 flex items-center gap-2 text-sm font-bold"><code className="text-fuchsia-600 dark:text-fuchsia-300">{pair.left}</code><span className="text-slate-400">vs</span><code className="text-cyan-600 dark:text-cyan-300">{pair.right}</code></div><p className="text-xs leading-6 text-slate-600 dark:text-slate-300">{pair.answer}</p></div>)}</div></section>
          </>}

          {tab==='paths' && <div className="mt-5 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <div className="space-y-3">{LEARNING_PATHS.map(path=>{const complete=path.items.filter(name=>mastered.has(DICTIONARY_ITEMS.find(item=>item.name===name)?.id)).length;return <button type="button" key={path.id} onClick={()=>setActivePath(path.id)} className={`w-full rounded-2xl border p-5 text-left transition-colors ${activePath===path.id?'border-fuchsia-500 bg-fuchsia-500/5 dark:bg-fuchsia-500/10':'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex justify-between gap-3"><div className="font-bold">{path.title}</div><span className="text-xs text-slate-500">{complete}/{path.items.length}</span></div><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{path.description}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-fuchsia-500" style={{width:`${(complete/path.items.length)*100}%`}} /></div></button>;})}</div>
            <section className={`${surface} p-6`}><div className={sectionLabel}>Guided learning path</div><h2 className="mt-2 text-2xl font-black">{activePathData.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{activePathData.description} Select each command to open its complete explanation, then mark it mastered.</p><div className="mt-6 space-y-3">{activePathData.items.map((name,i)=>{const item=DICTIONARY_ITEMS.find(x=>x.name===name);if(!item)return null;return <div key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold dark:bg-slate-800">{i+1}</span><div className="min-w-0 flex-1"><div className="font-mono text-sm font-bold">{name}</div><p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.definition}</p></div>{mastered.has(item.id)&&<CheckCheck className="h-4 w-4 text-emerald-500" />}<Button onClick={()=>openItem(item.id)} className="!px-2 !py-1.5">Learn <ArrowRight className="h-3.5 w-3.5" /></Button></div>;})}</div></section>
          </div>}

          {tab==='labs' && <div className="mt-5 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
            <section className="space-y-3" aria-label="Practice scenarios">{LABS.map(lab=><button type="button" key={lab.id} onClick={()=>{setActiveLab(lab.id);setShowSolution(false);}} className={`w-full rounded-2xl border p-4 text-left transition-colors ${activeLab===lab.id?'border-fuchsia-500 bg-fuchsia-500/5 dark:bg-fuchsia-500/10':'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}><div className="text-xs text-slate-500 dark:text-slate-400">{lab.category} · {lab.level}</div><h3 className="mt-1 font-bold">{lab.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{lab.question}</p></button>)}</section>
            <section className={`${surface} p-6`}><Pill className={DIFFICULTY[activeLabData.level]}>{activeLabData.level}</Pill><h2 className="mt-3 text-2xl font-black">{activeLabData.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeLabData.question}</p><div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"><div className={sectionLabel}>Your challenge</div><p className="mt-1 text-sm font-semibold">{activeLabData.goal}</p><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Try writing the SPL yourself first. This educational workspace does not execute real searches or connect to your Splunk server.</p></div><div className="mt-5"><Button variant="primary" icon={showSolution?CircleHelp:Play} onClick={()=>setShowSolution(x=>!x)}>{showSolution?'Hide walkthrough':'Reveal solution and explanation'}</Button></div>{showSolution&&<div className="mt-6 space-y-5"><div><div className="mb-2 flex items-center justify-between"><h3 className={sectionLabel}>Example solution</h3><Button icon={Copy} className="!py-1.5" onClick={()=>copy(activeLabData.query,'Lab SPL copied')}>Copy query</Button></div><Mono>{activeLabData.query}</Mono></div><div><h3 className={sectionLabel}>How it works</h3><ol className="mt-3 space-y-3">{activeLabData.steps.map((x,i)=><li className="flex gap-3 text-sm leading-6" key={x}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-300">{i+1}</span>{x}</li>)}</ol></div><div><h3 className={sectionLabel}>Expected result</h3><p className="mt-2 text-sm leading-6">{activeLabData.expected}</p></div><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6">{activeLabData.caveat}</div></div>}</section>
          </div>}

          {tab==='quiz' && <section className={`${surface} mx-auto mt-5 max-w-3xl p-6 sm:p-8`}>
            <div className="flex items-center justify-between gap-4"><div><p className={sectionLabel}>Applied knowledge</p><h2 className="mt-1 text-2xl font-black">Splunk knowledge check</h2></div><Trophy className="h-9 w-9 text-fuchsia-500" /></div>
            {!quizFinished ? <><div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>Question {quizIndex+1} of {QUIZ.length}</span><span>Correct so far: {correctAnswers}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-fuchsia-500" style={{width:`${((quizIndex+1)/QUIZ.length)*100}%`}} /></div><h3 className="mt-7 text-xl font-bold leading-8">{selectedQuiz.q}</h3><div className="mt-5 space-y-3">{selectedQuiz.options.map((option,i)=>{const revealed=quizAnswer!==null;const right=i===selectedQuiz.answer;return <button key={i} type="button" disabled={revealed} onClick={()=>{setQuizAnswer(i);if(i===selectedQuiz.answer)setCorrectAnswers(x=>x+1);}} className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-colors ${revealed&&right?'border-emerald-500 bg-emerald-500/10':revealed&&quizAnswer===i?'border-rose-500 bg-rose-500/10':'border-slate-200 bg-slate-50 hover:border-fuchsia-400 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-fuchsia-500'} ${revealed?'cursor-default':''}`}><span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-current/20 font-mono text-xs">{String.fromCharCode(65+i)}</span>{option}{revealed&&right&&<Check className="ml-2 inline h-4 w-4 text-emerald-500" />}</button>;})}</div>{quizAnswer!==null&&<div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm leading-6"><strong>{quizAnswer===selectedQuiz.answer?'Correct.':'The right answer is highlighted.'}</strong> {selectedQuiz.detail}</div>}<div className="mt-6 flex justify-end"><Button disabled={quizAnswer===null} variant="primary" icon={ArrowRight} onClick={nextQuiz}>{quizIndex===QUIZ.length-1?'See results':'Next question'}</Button></div></>:<div className="py-12 text-center"><Trophy className="mx-auto h-12 w-12 text-fuchsia-500" /><h3 className="mt-4 text-3xl font-black">{correctAnswers} / {QUIZ.length}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You completed the knowledge check. Review unfamiliar concepts in the command reference and try again.</p><Button variant="primary" icon={RotateCcw} className="mt-5" onClick={resetQuiz}>Retake quiz</Button></div>}
          </section>}

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <div><span className="font-bold text-slate-800 dark:text-slate-200">T.O Analytics · Splunk Command Academy</span><p className="mt-1">Educational reference, not a full Splunk parser or live query engine. Verify product/version compatibility.</p></div>
            <div className="flex flex-wrap gap-4"><a href={DOCS.spl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL reference <ExternalLink className="h-3 w-3" /></a><a href={DOCS.spl2} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL2 reference <ExternalLink className="h-3 w-3" /></a><a href={DOCS.comparison} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-fuchsia-500">SPL vs SPL2 <ExternalLink className="h-3 w-3" /></a></div>
          </footer>
        </div>
        {toast && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-xl border border-fuchsia-500/30 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div>}
      </div>
    </div>
  );
}


// import React, { useMemo, useState } from "react";
// import {
//   Search,
//   Sun,
//   Moon,
//   Copy,
//   Sparkles,
//   BookOpenCheck,
//   BrainCircuit,
//   Filter,
//   HelpCircle,
// } from "lucide-react";

// const TERMS = [
//   // ======== ARCHITECTURE ========
//   {
//     term: "Indexer",
//     definition: "Splunk component that receives, indexes, and stores data.",
//     student:
//       "Think of the indexer as the 'database' where all your logs end up.",
//     workplace:
//       "Production environments often have indexer clusters for high availability and performance.",
//     interview:
//       "Q: What is the difference between a Search Head and an Indexer?\nA: The Indexer stores and indexes data, the Search Head runs searches and presents results.",
//     example: "A bank uses 6 indexers to handle security and application logs.",
//     level: "Intermediate",
//     category: "Architecture",
//   },
//   {
//     term: "Search Head",
//     definition:
//       "Splunk component where users run searches, create dashboards, and interact with data.",
//     student:
//       "This is the web interface where you type SPL, build reports, and view dashboards.",
//     workplace:
//       "Search Head Clusters are used for high availability and to share knowledge objects.",
//     interview:
//       "Q: What happens if an indexer is down but the search head is up?\nA: You can still log in and run searches, but results may be incomplete or slow.",
//     example:
//       "SOC analysts log into the search head to investigate incidents using SPL.",
//     level: "Beginner",
//     category: "Architecture",
//   },
//   {
//     term: "Forwarder (Universal Forwarder)",
//     definition: "Lightweight Splunk agent that sends data to indexers.",
//     student:
//       "Installed on servers to collect logs and ship them to Splunk, but doesn’t do heavy parsing.",
//     workplace:
//       "Thousands of universal forwarders may be deployed across Linux/Windows servers.",
//     interview:
//       "Q: Difference between Universal Forwarder and Heavy Forwarder?\nA: UF only forwards (minimal parsing), HF can parse, filter, and route data.",
//     example:
//       "UF on a web server sends access.log to indexers in the security environment.",
//     level: "Intermediate",
//     category: "Data Ingestion",
//   },
//   {
//     term: "Heavy Forwarder",
//     definition:
//       "Full Splunk instance used as a forwarder with parsing and filtering capabilities.",
//     student:
//       "Heavier than a UF — can do transforms, filtering, and routing before data reaches indexers.",
//     workplace:
//       "Used for complex routing, filtering sensitive fields, or applying props/transforms centrally.",
//     interview:
//       "Q: When would you use a Heavy Forwarder?\nA: When you need advanced parsing, routing, or integration (e.g., syslog aggregation).",
//     example:
//       "HF receives firewall syslog and routes different sourcetypes to different indexes.",
//     level: "Advanced",
//     category: "Data Ingestion",
//   },
//   {
//     term: "Sourcetype",
//     definition: "Describes the format and structure of incoming data.",
//     student:
//       "It tells Splunk 'what kind of log this is' (e.g., apache:access, wineventlog).",
//     workplace:
//       "Good sourcetype naming and configuration makes field extraction and correlation easier.",
//     interview:
//       "Q: Why is sourcetype important?\nA: It controls how data is parsed, what fields are extracted, and how CIM mappings work.",
//     example:
//       "sourcetype=access_combined for Apache web logs with standard fields.",
//     level: "Beginner",
//     category: "Data Ingestion",
//   },
//   {
//     term: "Index",
//     definition: "Logical repository where Splunk stores indexed data.",
//     student:
//       "Like a separate 'bucket' for different data types: security, app, infra, etc.",
//     workplace:
//       "Indexes are used for access control (roles), retention, and performance tuning.",
//     interview:
//       "Q: Why split data into multiple indexes?\nA: For security (RBAC), different retention, and faster searches.",
//     example:
//       "index=security for SOC logs, index=web for website traffic, index=winevents for Windows logs.",
//     level: "Beginner",
//     category: "Architecture",
//   },

//   // ======== SPL & COMMANDS ========
//   {
//     term: "stats",
//     definition:
//       "SPL command used to calculate aggregate statistics over events.",
//     student:
//       "Use it to get counts, sums, averages, min/max, etc., grouped by fields.",
//     workplace:
//       "Used heavily in dashboards and reports for KPIs, error counts, user metrics.",
//     interview:
//       "Q: Difference between stats and eventstats?\nA: stats collapses events into a new table; eventstats adds aggregates back to each event.",
//     example: "index=web | stats count BY status",
//     level: "Beginner",
//     category: "SPL & Commands",
//   },
//   {
//     term: "eval",
//     definition: "Creates or modifies fields using expressions or functions.",
//     student:
//       "Think of it like a calculator that can build new fields on the fly.",
//     workplace:
//       "Used everywhere: cleaning fields, building flags (is_error), classifying events.",
//     interview:
//       "Q: What are common eval functions?\nA: if, case, len, tostring, coalesce, round, now, etc.",
//     example: `... | eval is_error = if(status>=500, 1, 0)`,
//     level: "Beginner",
//     category: "SPL & Commands",
//   },
//   {
//     term: "where",
//     definition: "Filters results using eval-style Boolean expressions.",
//     student:
//       "Similar to search, but allows more complex logic using field values and functions.",
//     workplace:
//       "Common in security use cases when you need expression-based filtering.",
//     interview:
//       "Q: Difference between search and where?\nA: search is keyword-based and simple operators; where uses eval expressions and functions.",
//     example: `... | where status>=500 AND like(uri, "/api%")`,
//     level: "Intermediate",
//     category: "SPL & Commands",
//   },
//   {
//     term: "timechart",
//     definition:
//       "Creates a time-based statistical chart, typically used in line charts.",
//     student:
//       "Use it when you want values over time, e.g., errors per minute or log volume per hour.",
//     workplace:
//       "Most dashboards with trends use timechart for visualizing metrics.",
//     interview:
//       "Q: When would you use stats vs timechart?\nA: stats for generic tables; timechart when you specifically need time-based buckets.",
//     example: `index=web | timechart count BY status`,
//     level: "Intermediate",
//     category: "SPL & Commands",
//   },
//   {
//     term: "rex",
//     definition: "Extracts fields using regular expressions.",
//     student:
//       "Use rex when automatic field extraction doesn't get what you need.",
//     workplace:
//       "Critical for ad-hoc parsing and quick extractions in investigations.",
//     interview:
//       "Q: When do you use rex vs field extractions in props.conf?\nA: rex for search-time ad-hoc extraction; props for reusable, production-grade extraction.",
//     example: `... | rex "user=(?<username>[^ ]+)"`,
//     level: "Intermediate",
//     category: "SPL & Commands",
//   },
//   {
//     term: "transaction",
//     definition: "Groups related events into a single transaction based on fields.",
//     student:
//       "Use it to combine login events, session events, or multi-step flows.",
//     workplace:
//       "Powerful but can be expensive; often replaced with stats-based approaches.",
//     interview:
//       "Q: When would you avoid transaction?\nA: On very large datasets due to performance; use stats with sessionization instead.",
//     example:
//       "index=web | transaction JSESSIONID maxspan=30m",
//     level: "Advanced",
//     category: "SPL & Commands",
//   },

//   // ======== DASHBOARDS & VISUALIZATION ========
//   {
//     term: "Token (Dashboard Token)",
//     definition:
//       "A variable used in Splunk dashboards to pass values between inputs, searches, and panels.",
//     student:
//       "Tokens make dashboards interactive: time pickers, dropdowns, drilldowns.",
//     workplace:
//       "Used in enterprise dashboards to control filters, environment switching, and drilldowns.",
//     interview:
//       "Q: What is the difference between input tokens and drilldown tokens?\nA: Input tokens come from form inputs; drilldown tokens come from clicking on panels.",
//     example:
//       "Using $server$ token from a dropdown to filter searches: index=web host=$server$",
//     level: "Intermediate",
//     category: "Dashboards",
//   },
//   {
//     term: "Base Search",
//     definition:
//       "A primary search used in a dashboard panel that other panels can reuse via post-process searches.",
//     student:
//       "One main search that runs once, then multiple panels refine it without rerunning everything.",
//     workplace:
//       "Reduces load by avoiding duplicated long searches across panels.",
//     interview:
//       "Q: Why use base searches?\nA: Performance and efficiency in dashboards with multiple related visualizations.",
//     example:
//       "Base search gets all events; child searches use stats/timechart for specific outputs.",
//     level: "Advanced",
//     category: "Dashboards",
//   },
//   {
//     term: "Drilldown",
//     definition:
//       "Dashboard interaction where clicking one panel opens another search, panel, or dashboard.",
//     student:
//       "Click on a bar and jump into detailed events or another dashboard.",
//     workplace:
//       "Common in SOC workflows: high-level summary → drilldown into raw events.",
//     interview:
//       "Q: Name examples of drilldown actions.\nA: Set tokens, open a new dashboard, link to external URLs, show raw events.",
//     example:
//       "Clicking on a src_ip opens another dashboard filtered by that IP.",
//     level: "Intermediate",
//     category: "Dashboards",
//   },

//   // ======== SECURITY / SOC / SIEM ========
//   {
//     term: "Notable Event",
//     definition:
//       "An event generated by ES correlation searches to highlight potential security issues.",
//     student:
//       "Think of it as an alert in the ES Incident Review dashboard.",
//     workplace:
//       "SOC analysts triage notable events for true/false positives and incident handling.",
//     interview:
//       "Q: What generates notable events?\nA: Correlation searches in Splunk Enterprise Security.",
//     example:
//       "Multiple failed logins followed by a success from a new country creates a notable.",
//     level: "Intermediate",
//     category: "Security / ES",
//   },
//   {
//     term: "Correlation Search",
//     definition:
//       "Scheduled or real-time search in Enterprise Security that detects suspicious patterns.",
//     student:
//       "A saved SPL search that looks for bad behavior and creates notable events.",
//     workplace:
//       "Core of ES detection content; mapped to MITRE techniques.",
//     interview:
//       "Q: What makes a good correlation search?\nA: Clear purpose, low false positives, mapped to use case, and tunable.",
//     example:
//       "Detection of lateral movement by correlating authentication and endpoint logs.",
//     level: "Advanced",
//     category: "Security / ES",
//   },

//   // ======== TROUBLESHOOTING ========
//   {
//     term: "btool",
//     definition:
//       "Splunk CLI utility to view the combined, effective configuration from all conf files.",
//     student:
//       "Use it when configs are not behaving as expected (e.g., props, transforms).",
//     workplace:
//       "Important for debugging complex environments with many app layers.",
//     interview:
//       "Q: When would you use btool?\nA: To see which settings are actually applied after app/priority merges.",
//     example:
//       "splunk btool props list --debug",
//     level: "Advanced",
//     category: "Troubleshooting",
//   },
//   {
//     term: "splunkd",
//     definition: "The main Splunk server daemon that handles most Splunk operations.",
//     student:
//       "The core Splunk service — if splunkd is down, Splunk is essentially down.",
//     workplace:
//       "Monitoring splunkd logs is essential for health and performance troubleshooting.",
//     interview:
//       "Q: Where do you check when Splunk behaves strangely?\nA: splunkd.log on the relevant instance.",
//     example:
//       "$SPLUNK_HOME/var/log/splunk/splunkd.log",
//     level: "Intermediate",
//     category: "Troubleshooting",
//   },
// ];

// const LEVEL_COLORS = {
//   Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
//   Intermediate: "bg-sky-500/15 text-sky-300 border-sky-500/40",
//   Advanced: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40",
// };

// const CATEGORIES = [
//   "All",
//   "Architecture",
//   "SPL & Commands",
//   "Data Ingestion",
//   "Dashboards",
//   "Security / ES",
//   "Troubleshooting",
// ];

// const SplunkDictionary = () => {
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All");
//   const [isDark, setIsDark] = useState(true);
//   const [quizTerm, setQuizTerm] = useState(null);
//   const [showAnswer, setShowAnswer] = useState(false);

//   const filteredTerms = useMemo(() => {
//     return TERMS.filter((t) => {
//       const matchesCategory =
//         category === "All" || t.category === category;
//       const q = search.toLowerCase();
//       const matchesSearch =
//         t.term.toLowerCase().includes(q) ||
//         t.definition.toLowerCase().includes(q) ||
//         t.category.toLowerCase().includes(q);
//       return matchesCategory && matchesSearch;
//     }).sort((a, b) => a.term.localeCompare(b.term));
//   }, [search, category]);

//   const toggleTheme = () => setIsDark((prev) => !prev);

//   const handleCopy = async (item) => {
//     const text = [
//       `Term: ${item.term}`,
//       `Definition: ${item.definition}`,
//       `Student view: ${item.student}`,
//       `Workplace view: ${item.workplace}`,
//       `Interview: ${item.interview}`,
//       `Example: ${item.example}`,
//       `Level: ${item.level}`,
//       `Category: ${item.category}`,
//     ].join("\n");
//     try {
//       await navigator.clipboard.writeText(text);
//       alert("Copied to clipboard ✅");
//     } catch {
//       alert("Could not copy. Please copy manually.");
//     }
//   };

//   const startQuiz = () => {
//     if (!TERMS.length) return;
//     const randomIndex = Math.floor(Math.random() * TERMS.length);
//     setQuizTerm(TERMS[randomIndex]);
//     setShowAnswer(false);
//   };

//   const containerClasses = isDark
//     ? "min-h-screen bg-[#020617] text-slate-100"
//     : "min-h-screen bg-slate-50 text-slate-900";

//   const cardClasses = (extra = "") =>
//     isDark
//       ? `bg-[#020617]/70 border border-slate-700 shadow-md ${extra}`
//       : `bg-white border border-slate-200 shadow-sm ${extra}`;

//   return (
//     <div className={containerClasses + " p-6"}>

//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//         <div>
//           <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/40 mb-2">
//             {/* <Sparkles className="h-3 w-3 text-cyan-400" /> */}
//             {/* <span>T.O Analytics · Splunk Bootcamp</span> */}
//           </div>
//           <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 pt-6">
//             <BookOpenCheck className="h-8 w-8 text-cyan-400" />
//             Splunk Dictionary
//           </h1>
//           <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
//             A practical Splunk terms dictionary for students, job interviews, and
//             real-world work. Search, learn, copy, and quiz yourself in one place.
//           </p>
//         </div>

//         {/* Theme toggle */}
//         <button
//           onClick={toggleTheme}
//           className={
//             (isDark
//               ? "bg-slate-800 border-slate-600 text-slate-100"
//               : "bg-white border-slate-200 text-slate-900") +
//             " inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium shadow-sm"
//           }
//         >
//           {isDark ? (
//             <>
//               <Sun className="h-4 w-4 text-amber-400" />
//               <span>Light mode</span>
//             </>
//           ) : (
//             <>
//               <Moon className="h-4 w-4 text-indigo-500" />
//               <span>Dark mode</span>
//             </>
//           )}
//         </button>
//       </header>

//       {/* Controls */}
//       <section className="flex flex-col lg:flex-row gap-4 mb-6">
//         {/* Search */}
//         <div className={cardClasses("flex-1 flex items-center px-4 py-3 rounded-2xl")}>
//           <Search
//             className={
//               "h-5 w-5 mr-2 " +
//               (isDark ? "text-cyan-400" : "text-cyan-600")
//             }
//           />
//           <input
//             type="text"
//             placeholder="Search Splunk terms, e.g. indexer, stats, token..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className={
//               "w-full bg-transparent outline-none text-sm md:text-base " +
//               (isDark ? "placeholder:text-slate-500" : "placeholder:text-slate-400")
//             }
//           />
//         </div>

//         {/* Category filter */}
//         <div
//           className={cardClasses(
//             "flex items-center gap-2 px-4 py-3 rounded-2xl"
//           )}
//         >
//           <Filter className="h-4 w-4 text-slate-400" />
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className={
//               "bg-transparent outline-none text-sm md:text-base flex-1 " +
//               (isDark ? "text-slate-100" : "text-slate-900")
//             }
//           >
//             {CATEGORIES.map((c) => (
//               <option
//                 key={c}
//                 value={c}
//                 className={isDark ? "bg-slate-900" : "bg-white"}
//               >
//                 {c}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Quiz launcher */}
//         <button
//           onClick={startQuiz}
//           className={
//             "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold " +
//             (isDark
//               ? "bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white shadow-lg"
//               : "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md")
//           }
//         >
//           <BrainCircuit className="h-4 w-4" />
//           Quiz me
//         </button>
//       </section>

//       {/* Quiz area */}
//       {quizTerm && (
//         <section className={cardClasses("mb-6 rounded-2xl p-4 md:p-5")}>
//           <div className="flex items-center gap-2 mb-2">
//             <HelpCircle className="h-4 w-4 text-amber-400" />
//             <span className="text-sm font-semibold uppercase tracking-wide text-amber-400">
//               Quick Quiz
//             </span>
//           </div>
//           <p className="text-sm md:text-base font-semibold mb-2">
//             What is: <span className="text-cyan-400">{quizTerm.term}</span>?
//           </p>
//           <p className="text-xs md:text-sm text-slate-400 mb-3">
//             Think about the definition, where it's used, and a simple example.
//           </p>
//           {showAnswer ? (
//             <div
//               className={
//                 "mt-2 rounded-xl px-3 py-3 text-xs md:text-sm " +
//                 (isDark ? "bg-slate-900/80" : "bg-slate-100")
//               }
//             >
//               <p className="font-semibold mb-1">Definition</p>
//               <p className="mb-1">{quizTerm.definition}</p>
//               <p className="font-semibold mt-2 mb-1">Workplace</p>
//               <p className="mb-1">{quizTerm.workplace}</p>
//               <p className="font-semibold mt-2 mb-1">Interview angle</p>
//               <pre className="whitespace-pre-wrap text-xs">
//                 {quizTerm.interview}
//               </pre>
//             </div>
//           ) : null}
//           <div className="mt-3 flex gap-2">
//             <button
//               onClick={() => setShowAnswer((v) => !v)}
//               className={
//                 "px-3 py-1.5 rounded-full text-xs font-medium border " +
//                 (isDark
//                   ? "border-slate-600 hover:border-slate-400"
//                   : "border-slate-300 hover:border-slate-500")
//               }
//             >
//               {showAnswer ? "Hide answer" : "Show answer"}
//             </button>
//             <button
//               onClick={startQuiz}
//               className={
//                 "px-3 py-1.5 rounded-full text-xs font-medium " +
//                 (isDark
//                   ? "bg-cyan-600 hover:bg-cyan-500"
//                   : "bg-cyan-500 hover:bg-cyan-400") +
//                 " text-white"
//               }
//             >
//               Next question
//             </button>
//           </div>
//         </section>
//       )}

//       {/* Main list */}
//       <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-10">
//         {filteredTerms.map((item) => (
//           <article
//             key={item.term}
//             className={cardClasses(
//               "rounded-2xl p-4 md:p-5 flex flex-col justify-between"
//             )}
//           >
//             <div>
//               <div className="flex items-start justify-between gap-2 mb-2">
//                 <h2 className="text-lg md:text-xl font-semibold">
//                   {item.term}
//                 </h2>
//                 <span
//                   className={
//                     "px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border " +
//                     (LEVEL_COLORS[item.level] || LEVEL_COLORS.Beginner)
//                   }
//                 >
//                   {item.level}
//                 </span>
//               </div>
//               <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
//                 {item.category}
//               </p>

//               <p className="text-sm md:text-[15px] mb-2">
//                 {item.definition}
//               </p>

//               <div className="space-y-1.5 text-xs md:text-sm text-slate-400">
//                 <p>
//                   <span className="font-semibold text-slate-300">
//                     🎓 Student:
//                   </span>{" "}
//                   {item.student}
//                 </p>
//                 <p>
//                   <span className="font-semibold text-slate-300">
//                     🏢 Workplace:
//                   </span>{" "}
//                   {item.workplace}
//                 </p>
//                 <p>
//                   <span className="font-semibold text-slate-300">
//                     💼 Interview:
//                   </span>
//                   <br />
//                   <span className="whitespace-pre-wrap">
//                     {item.interview}
//                   </span>
//                 </p>
//                 <p>
//                   <span className="font-semibold text-slate-300">
//                     💡 Example:
//                   </span>{" "}
//                   {item.example}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-3 flex items-center justify-between gap-2">
//               <button
//                 onClick={() => handleCopy(item)}
//                 className={
//                   "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border " +
//                   (isDark
//                     ? "border-slate-600 hover:border-cyan-500"
//                     : "border-slate-300 hover:border-cyan-500")
//                 }
//               >
//                 <Copy className="h-3 w-3" />
//                 Copy cheat sheet
//               </button>
//             </div>
//           </article>
//         ))}
//       </section>

//       {/* Extra: Link to command reference */}
//       <section className={cardClasses("rounded-2xl p-4 md:p-5")}>
//         <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold mb-1">
//           <BookOpenCheck className="h-4 w-4 text-cyan-400" />
//           Splunk Command Reference (PDF)
//         </h3>
//         <p className="text-xs md:text-sm text-slate-400 mb-2">
//           For quick reference of SPL commands, eval functions, stats functions,
//           regex, and time formats.
//         </p>
//         <a
//           href="https://drive.google.com/file/d/1jAkmrbTWQApPg7qg43bBfAe4bEg8o0VT/preview"
//           target="_blank"
//           rel="noreferrer"
//           className={
//             "inline-flex items-center gap-1 text-xs md:text-sm font-medium underline " +
//             (isDark ? "text-cyan-300" : "text-cyan-700")
//           }
//         >
//           Open Splunk reference PDF
//         </a>
//       </section>
//     </div>
//   );
// };

// export default SplunkDictionary;
