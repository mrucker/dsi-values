function loadingAsHTML() {
    return '<div class="loading lds-css ng-scope" style="width: 100px; height: 100px;">'
         +   '<div class="lds-spinner" style="100%;height:100%">'
         +     '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>'
         +   '</div>'
         + '<style type="text/css">'
         +   '@keyframes lds-spinner {'
         +     '0% {'
         +       'opacity: 1;'
         +     '}'
         +     '100% {'
         +       'opacity: 0;'
         +     '}'
         +   '}'
         +   '@-webkit-keyframes lds-spinner {'
         +     '0% {'
         +       'opacity: 1;'
         +     '}'
         +     '100% {'
         +       'opacity: 0;'
         +     '}'
         +   '}'
         +   '.lds-spinner {'
         +     'position: relative;'
         +   '}'
         +   '.lds-spinner div {'
         +     'left: 97px;'
         +     'top: 48px;'
         +     'position: absolute;'
         +     '-webkit-animation: lds-spinner linear 1s infinite;'
         +     'animation: lds-spinner linear 1s infinite;'
         +     'background: #CCA43B;'
         +     'width: 6px;'
         +     'height: 24px;'
         +     'border-radius: 20%;'
         +     '-webkit-transform-origin: 3px 52px;'
         +     'transform-origin: 3px 52px;'
         +   '}'
         +   '.lds-spinner div:nth-child(1) {'
         +     '-webkit-transform: rotate(0deg);'
         +     'transform: rotate(0deg);'
         +     '-webkit-animation-delay: -0.909090909090909s;'
         +     'animation-delay: -0.909090909090909s;'
         +   '}'
         +   '.lds-spinner div:nth-child(2) {'
         +     '-webkit-transform: rotate(32.72727272727273deg);'
         +     'transform: rotate(32.72727272727273deg);'
         +     '-webkit-animation-delay: -0.818181818181818s;'
         +     'animation-delay: -0.818181818181818s;'
         +   '}'
         +   '.lds-spinner div:nth-child(3) {'
         +     '-webkit-transform: rotate(65.45454545454545deg);'
         +     'transform: rotate(65.45454545454545deg);'
         +     '-webkit-animation-delay: -0.727272727272727s;'
         +     'animation-delay: -0.727272727272727s;'
         +   '}'
         +   '.lds-spinner div:nth-child(4) {'
         +     '-webkit-transform: rotate(98.18181818181819deg);'
         +     'transform: rotate(98.18181818181819deg);'
         +     '-webkit-animation-delay: -0.636363636363636s;'
         +     'animation-delay: -0.636363636363636s;'
         +   '}'
         +   '.lds-spinner div:nth-child(5) {'
         +     '-webkit-transform: rotate(130.9090909090909deg);'
         +     'transform: rotate(130.9090909090909deg);'
         +     '-webkit-animation-delay: -0.545454545454545s;'
         +     'animation-delay: -0.545454545454545s;'
         +   '}'
         +   '.lds-spinner div:nth-child(6) {'
         +     '-webkit-transform: rotate(163.63636363636363deg);'
         +     'transform: rotate(163.63636363636363deg);'
         +     '-webkit-animation-delay: -0.454545454545455s;'
         +     'animation-delay: -0.454545454545455s;'
         +   '}'
         +   '.lds-spinner div:nth-child(7) {'
         +     '-webkit-transform: rotate(196.36363636363637deg);'
         +     'transform: rotate(196.36363636363637deg);'
         +     '-webkit-animation-delay: -0.363636363636364s;'
         +     'animation-delay: -0.363636363636364s;'
         +   '}'
         +   '.lds-spinner div:nth-child(8) {'
         +     '-webkit-transform: rotate(229.0909090909091deg);'
         +     'transform: rotate(229.0909090909091deg);'
         +     '-webkit-animation-delay: -0.272727272727273s;'
         +     'animation-delay: -0.272727272727273s;'
         +   '}'
         +   '.lds-spinner div:nth-child(9) {'
         +     '-webkit-transform: rotate(261.8181818181818deg);'
         +     'transform: rotate(261.8181818181818deg);'
         +     '-webkit-animation-delay: -0.181818181818182s;'
         +     'animation-delay: -0.181818181818182s;'
         +   '}'
         +   '.lds-spinner div:nth-child(10) {'
         +     '-webkit-transform: rotate(294.54545454545456deg);'
         +     'transform: rotate(294.54545454545456deg);'
         +     '-webkit-animation-delay: -0.090909090909091s;'
         +     'animation-delay: -0.090909090909091s;'
         +   '}'
         +   '.lds-spinner div:nth-child(11) {'
         +     '-webkit-transform: rotate(327.27272727272725deg);'
         +     'transform: rotate(327.27272727272725deg);'
         +     '-webkit-animation-delay: 0s;'
         +     'animation-delay: 0s;'
         +   '}'
         +   '.lds-spinner {'
         +     'width: 200px !important;'
         +     'height: 200px !important;'
         +     '-webkit-transform: translate(-100px, -100px) scale(.5) translate(100px, 100px);'
         +     'transform: translate(-100px, -100px) scale(.5) translate(100px, 100px);'
         +   '}'
         +   '</style>'
         + '</div>';
}