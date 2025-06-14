export default async function ({ text, postId, cookies, csrfToken }) {
  const out = await (
    await fetch(
      `https://pro.x.com/i/api/graphql/IVdJU2Vjw2llhmJOAZy9Ow/CreateTweet`,
      {
        headers: {
          Accept: "*/*",
          "accept-language": "en-US,en;q=0.9",

          authorization:
            "Bearer AAAAAAAAAAAAAAAAAAAAAFQODgEAAAAAVHTp76lzh3rFzcHbmHVvQxYYpTw%3DckAlMINMjmCwxUcaXbAN4XqJVdgMJaHqNOFgPMK0zN1qLqLQCF",
          "content-type": "application/json",

          "x-client-transaction-id": Math.random().toString().replace("0.", ""),
          "x-csrf-token": csrfToken,

          "x-twitter-active-user": "yes",
          "x-twitter-auth-type": "OAuth2Session",
          "x-twitter-client-language": "en",

          cookie: cookies,
          "cache-control": "no-cache",
          "content-type": "application/json",
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
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
        },
        method: "POST",
        body: JSON.stringify({
          variables: {
            tweet_text: text,
            reply: {
              in_reply_to_tweet_id: postId,
              exclude_reply_user_ids: [],
            },
            dark_request: false,
            media: { media_entities: [], possibly_sensitive: false },
            semantic_annotation_ids: [],
            disallowed_reply_options: null,
          },
          features: {
            premium_content_api_read_enabled: false,
            communities_web_enable_tweet_community_results_fetch: true,
            c9s_tweet_anatomy_moderator_badge_enabled: true,
            responsive_web_grok_analyze_button_fetch_trends_enabled: false,
            responsive_web_grok_analyze_post_followups_enabled: true,
            responsive_web_jetfuel_frame: false,
            responsive_web_grok_share_attachment_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            responsive_web_twitter_article_tweet_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            responsive_web_grok_show_grok_translated_post: false,
            responsive_web_grok_analysis_button_from_backend: true,
            creator_subscriptions_quote_tweet_preview_enabled: false,
            longform_notetweets_rich_text_read_enabled: true,
            longform_notetweets_inline_media_enabled: true,
            profile_label_improvements_pcf_label_in_post_enabled: true,
            rweb_tipjar_consumption_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            articles_preview_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: true,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
            responsive_web_grok_image_annotation_enabled: true,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_enhance_cards_enabled: false,
            includePromotedContent: false,
          },
          queryId: "IVdJU2Vjw2llhmJOAZy9Ow",
        }),
      }
    )
  ).json();

  if (!out?.data?.create_tweet) {
    console.error("[post composer]", out);
    return;
  }

  console.log(`[post composer] post created`, {
    text,
    postId,
    csrfToken,
    url: `https://x.com/i/status/${out?.data?.create_tweet?.tweet_results?.result?.legacy?.id_str}`,
    output: out,
  });
}
