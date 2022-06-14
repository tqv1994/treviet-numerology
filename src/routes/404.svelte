<script>
    import { scale } from 'svelte/transition';
    function onLoad(){
        document.body.classList.add('bg-default');
    }
    </script>
    <svelte:window on:loadstart={onLoad}/>
    
    <div in:scale={{ y: 200, duration: 500 }} out:scale={{ y: 200, duration: 100 }}>
        <div>
            <!-- Header -->
            <div class="header bg-gradient-green py-7 py-lg-8 pt-lg-9">
              <div class="container">
                <div class="header-body text-center mb-7">
                  <div class="justify-content-center row">
                    <div class="px-5 col-xl-5 col-lg-6 col-md-6">
                      <h1 class="text-light">404 NOT FOUND!</h1>
                      <p class="text-lead text-white">
                        Không tìm thấy trang. Vui lòng thử lại với đường dẫn khác
                      </p>
          
                      <a href="/" class="font-weight-bold text-white mt-5">
                        Quay lại trang chủ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="separator separator-bottom separator-skew zindex-100">
                <svg
                  x="0"
                  y="0"
                  viewBox="0 0 2560 100"
                  preserveAspectRatio="none"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg">
                  <polygon class="fill-default" points="2560 0 2560 100 0 100" />
                </svg>
              </div>
            </div>
            <!-- Page content -->
            <section class="py-6">
              <div class="container">
                <div class="row align-items-center row-grid">
                  <div class="col-md-6">
                    
                  </div>
                  <div class="col-md-6">
                    <div class="pr-md-5">
                      
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
    </div>
    
    <style>
        .card-policy {
            background: #f7fafc;
            color: black;
            z-index: 0;
        }
    
        .card-policy p {
            line-height: 30px;
        }
    </style>
    