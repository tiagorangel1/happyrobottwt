export default async function ({ cookies, csrfToken }) {
  const response = await (
    await fetch(
      `https://pro.x.com/i/api/graphql/WERRji0vXRGrMiQ8LPZ3sw/NotificationsTimeline?variables=${encodeURIComponent(
        JSON.stringify({ timeline_type: "All", count: 20 })
      )}&features=${encodeURIComponent(
        JSON.stringify({
          rweb_video_screen_enabled: false,
          profile_label_improvements_pcf_label_in_post_enabled: true,
          rweb_tipjar_consumption_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          creator_subscriptions_tweet_preview_api_enabled: true,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          premium_content_api_read_enabled: false,
          communities_web_enable_tweet_community_results_fetch: true,
          c9s_tweet_anatomy_moderator_badge_enabled: true,
          responsive_web_grok_analyze_button_fetch_trends_enabled: false,
          responsive_web_grok_analyze_post_followups_enabled: true,
          responsive_web_jetfuel_frame: false,
          responsive_web_grok_share_attachment_enabled: true,
          articles_preview_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          responsive_web_twitter_article_tweet_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          responsive_web_grok_show_grok_translated_post: false,
          responsive_web_grok_analysis_button_from_backend: false,
          creator_subscriptions_quote_tweet_preview_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: true,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
          longform_notetweets_rich_text_read_enabled: true,
          longform_notetweets_inline_media_enabled: true,
          responsive_web_grok_image_annotation_enabled: true,
          responsive_web_enhance_cards_enabled: false,
        })
      )}`,
      {
        headers: {
          Accept: "*/*",
          authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAAFQODgEAAAAAVHTp76lzh3rFzcHbmHVvQxYYpTw%3DckAlMINMjmCwxUcaXbAN4XqJVdgMJaHqNOFgPMK0zN1qLqLQCF",
          "content-type": "application/json",
          "x-csrf-token": csrfToken,
          "x-twitter-active-user": "yes",
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-client-language": "en",
          cookie: cookies,
          "cache-control": "no-cache",
          pragma: "no-cache",
          priority: "u=1, i",
          "sec-ch-ua": '"Chromium";v="135", "Not-A.Brand";v="8"',
          "sec-ch-ua-arch": '"arm"',
          "sec-ch-ua-bitness": '"64"',
          "sec-ch-ua-full-version": '"135.0.7049.85"',
          "sec-ch-ua-full-version-list":
            '"Chromium";v="135.0.7049.85", "Not-A.Brand";v="8.0.0.0"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": '""',
          "sec-ch-ua-platform": '"macOS"',
          "sec-ch-ua-platform-version": '"15.5.0"',
          cookie: cookies,
        },
      }
    )
  ).json();

  return response.data.viewer_v2.user_results.result.notification_timeline.timeline.instructions.find(
    (instruction) => {
      return instruction.type === "TimelineAddEntries";
    }
  ).entries;
}
