// API documentation: https://realfavicongenerator.net/api/non_interactive_api

export namespace RealFaviconGenerator {
  export type OnConflictBehavior = 'raise_error' | 'override' | 'keep_existing';

  export interface GenerationRequest {
    favicon_generation: {
      api_key: string;
      master_picture:
        | {
            type: 'inline';
            content: string;
          }
        | {
            type: 'url';
            url: string;
          };
      files_location?:
        | {
            type: 'path';
            path: string;
          }
        | {
            type: 'root';
          };
      favicon_design: {
        desktop_browser?: {};
        ios?: {
          app_name?: string;
          startup_image?: {
            master_picture:
              | {
                  type: 'inline';
                  content: string;
                }
              | {
                  type: 'url';
                  url: string;
                };
            background_color: string;
          };
          assets?: {
            ios6_and_prior_icons: boolean;
            ios7_and_later_icons: boolean;
            precomposed_icons: boolean;
            declare_only_default_icon: boolean;
          };
        } & (
          | { picture_aspect: 'no_change' }
          | { picture_aspect: 'background_and_margin'; margin: number | string; background_color: string }
        );
        windows?: {
          app_name?: string;
          picture_aspect: 'no_change' | 'white_silhouette';
          background_color: string;
          assets?: {
            windows_80_ie_10_tile: boolean;
            windows_10_ie_11_edge_tiles: {
              small: boolean;
              medium: boolean;
              big: boolean;
              rectangle: boolean;
            };
          };
        } & ({ existing_manifest: string; on_conflict: OnConflictBehavior } | {});
        firefox_app?: {
          manifest: {
            app_name: string;
            app_description: string;
            developer_name: string;
            developer_url: string;
          };
        } & (
          | { picture_aspect: 'no_change' }
          | {
              picture_aspect: 'circle';
              background_color: string;
              margin: number | string;
              keep_picture_in_circle: boolean;
              circle_inner_margin: boolean;
              overlay: boolean;
            }
          | {
              picture_aspect: 'rounded_square' | 'square';
              background_color: string;
              margin: number | string;
            }
        );
        android_chrome?: {
          manifest: {
            name: string;
            display: 'browser' | 'standalone';
            orientation: 'portrait' | '	landscape';
            start_url: string;
          } & ({ existing_manifest: string; on_conflict: OnConflictBehavior } | {});
          assets: {
            legacy_icon: boolean;
            low_resolution_icons: boolean;
          };
          theme_color: string;
        } & (
          | { picture_aspect: 'no_change' }
          | { picture_aspect: 'background_and_margin'; margin: number | string; background_color: string }
          | { picture_aspect: 'shadow' }
        );
        safari_pinned_tab?: {
          theme_color: string;
        } & ({ picture_aspect: 'no_change' | 'silhouette' } | { picture_aspect: 'black_and_white'; threshold: number });
        coast?: {} & (
          | { picture_aspect: 'background_and_margin'; background_color: string; margin: number | string }
          | { picture_aspect: 'no_change' }
        );
        open_graph?: {} & (
          | {
              picture_aspect: 'background_and_margin';
              background_color: string;
              margin: number | string;
              ratio: string;
            }
          | { picture_aspect: 'no_change' }
        );
      };
      settings: {
        compression: 0 | 1 | 2 | 3 | 4 | 5 | '0' | '1' | '2' | '3' | '4' | '5';
        scaling_algorithm: 'Mitchell' | 'NearestNeighbor' | 'Cubic' | 'Bilinear' | 'Lanczos' | 'Spline';
        error_on_image_too_small?: boolean;
        readme_file?: boolean;
        html_code_file?: boolean;
        use_path_as_is?: boolean;
      };
      versioning:
        | boolean
        | {
            param_name: string;
            param_value: string;
          };
    };
  }

  export interface GenerationResponse {
    favicon_generation_result: {
      result: {
        status: string;
      };
      favicon: FaviconInfo;
      files_location: {
        type: string;
        path: string;
      };
      preview_picture_url: string;
      version: string;
    };
  }

  export interface FaviconInfo {
    package_url: string;
    files_urls: string[];
    html_code: string;
    compression: string;
    overlapping_markups: string[];
  }
}
